import { Router } from 'express'
import type { Response } from 'express'
import { all, one, run } from '../db.js'
import type { MissionProgressRecord, MissionProgressPayload } from '../types/api.types.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import { completeMission } from '../lib/rewards.js'

export const missionsRouter = Router()

const MISSION_ID_RE = /^m(0[1-9]|1[0-9]|20)$/
const VALID_STATUSES: readonly string[] = ['locked', 'active', 'completed']

// GET /me — all mission progress rows for the authenticated player
missionsRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.json(await all<MissionProgressRecord>('SELECT * FROM mission_progress WHERE player_id = ?', [`player-${req.userId as string}`]))
})

// POST / — upsert mission progress (never lowers stars or un-completes a mission), then sync the player's total stars
missionsRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const body = (req.body ?? {}) as Partial<MissionProgressPayload>
  const { missionId, status, tasksComplete, starsEarned, completedAt } = body
  const playerId = `player-${req.userId as string}`

  if (
    typeof missionId !== 'string' || !MISSION_ID_RE.test(missionId) ||
    typeof status !== 'string' || !VALID_STATUSES.includes(status) ||
    typeof starsEarned !== 'number' || !Number.isInteger(starsEarned) || starsEarned < 0 || starsEarned > 3
  ) {
    res.status(400).json({ error: 'missionId, a valid status and starsEarned (0-3) are required' })
    return
  }

  await run(
    `INSERT INTO mission_progress (player_id, mission_id, status, tasks_complete, stars_earned, completed_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(player_id, mission_id) DO UPDATE SET
       status         = CASE WHEN mission_progress.status = 'completed' THEN 'completed' ELSE excluded.status END,
       tasks_complete = excluded.tasks_complete,
       stars_earned   = MAX(mission_progress.stars_earned, excluded.stars_earned),
       completed_at   = COALESCE(mission_progress.completed_at, excluded.completed_at)`,
    [playerId, missionId, status, JSON.stringify(Array.isArray(tasksComplete) ? tasksComplete : []), starsEarned, completedAt ?? null],
  )
  const total = (await one<{ total: number }>('SELECT COALESCE(SUM(stars_earned), 0) AS total FROM mission_progress WHERE player_id = ?', [playerId]))?.total ?? 0
  await run("UPDATE players SET total_stars = ?, updated_at = datetime('now') WHERE id = ?", [total, playerId])
  res.json({ ok: true, totalStars: total })
})

// POST /complete — the server calculates the XP reward; the client only reports the mission and stars
missionsRouter.post('/complete', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const result = await completeMission(req.userId as string, (req.body ?? {}) as Record<string, unknown>)
  res.status(result.status).json(result.body)
})

export default missionsRouter
