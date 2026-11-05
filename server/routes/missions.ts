import { Router } from 'express'
import type { Request, Response } from 'express'
import { db } from '../db.js'
import type { MissionProgressRecord, MissionProgressPayload } from '../types/api.types.js'

export const missionsRouter = Router()

// ── GET /:playerId — return all mission progress rows for that player ────────────

missionsRouter.get('/:playerId', (req: Request, res: Response): void => {
  const { playerId } = req.params
  const rows = db
    .prepare('SELECT * FROM mission_progress WHERE player_id = ?')
    .all(playerId) as MissionProgressRecord[]
  res.json(rows)
})

// ── POST / — upsert mission progress, sync total_stars on player ─────────────────

missionsRouter.post('/', (req: Request, res: Response): void => {
  const body = req.body as Partial<MissionProgressPayload>

  const { playerId, missionId, status, tasksComplete, starsEarned, completedAt } = body

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
