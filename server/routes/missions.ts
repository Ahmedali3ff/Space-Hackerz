import { Router } from 'express'
import type { Request, Response } from 'express'
import { db } from '../db.js'
import type { MissionProgressRecord, MissionProgressPayload } from '../types/api.types.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'

export const missionsRouter = Router()

// ── GET /:playerId — return all mission progress rows for that player ────────────

missionsRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const playerId = `player-${req.userId as string}`
  const rows = db
    .prepare('SELECT * FROM mission_progress WHERE player_id = ?')
    .all(playerId) as MissionProgressRecord[]
  res.json(rows)
})

// ── POST / — upsert mission progress, sync total_stars on player ─────────────────

missionsRouter.post('/', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const body = req.body as Partial<MissionProgressPayload>

  const { missionId, status, tasksComplete, starsEarned, completedAt } = body
  const playerId = `player-${req.userId as string}`

  if (
    typeof playerId !== 'string' ||
    typeof missionId !== 'string' ||
    typeof status !== 'string' ||
    typeof starsEarned !== 'number'
  ) {
    res.status(400).json({ error: 'playerId, missionId, status, starsEarned are required' })
    return
  }

  const tasksJson = JSON.stringify(Array.isArray(tasksComplete) ? tasksComplete : [])

  db.prepare(`
    INSERT INTO mission_progress (player_id, mission_id, status, tasks_complete, stars_earned, completed_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(player_id, mission_id) DO UPDATE SET
      status        = excluded.status,
      tasks_complete = excluded.tasks_complete,
      stars_earned  = excluded.stars_earned,
      completed_at  = excluded.completed_at
  `).run(playerId, missionId, status, tasksJson, starsEarned, completedAt ?? null)

  // Sync total_stars on player = SUM of all stars for this player
  const starResult = db
    .prepare('SELECT COALESCE(SUM(stars_earned), 0) as total FROM mission_progress WHERE player_id = ?')
    .get(playerId) as { total: number }

  db.prepare(`
    UPDATE players SET total_stars = ?, updated_at = datetime('now') WHERE id = ?
  `).run(starResult.total, playerId)

  res.json({ ok: true, totalStars: starResult.total })
})

export default missionsRouter
