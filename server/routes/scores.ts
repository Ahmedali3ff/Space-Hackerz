import { Router } from 'express'
import type { Request, Response } from 'express'
import { db } from '../db.js'
import type { MissionRunPayload, LeaderboardEntry } from '../types/api.types.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'

export const scoresRouter = Router()

// ── POST / — insert a mission run record ─────────────────────────────────────────

scoresRouter.post('/', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const body = req.body as Partial<MissionRunPayload>

  const {
    id,
    playerId,
    missionId,
    planetId,
    crewSize,
    missionDurationDays,
    daysSurvived,
    finalScore,
    starsEarned,
    outcome,
    eventsResolved,
  } = body
  const authenticatedPlayerId = `player-${req.userId as string}`

  if (
    typeof id !== 'string' ||
    typeof playerId !== 'string' ||
    typeof missionId !== 'string' ||
    typeof planetId !== 'string' ||
    typeof crewSize !== 'number' ||
    typeof missionDurationDays !== 'number' ||
    typeof daysSurvived !== 'number' ||
    typeof finalScore !== 'number' ||
    typeof starsEarned !== 'number' ||
    typeof outcome !== 'string'
  ) {
    res.status(400).json({ error: 'Missing or invalid required fields' })
    return
  }

  db.prepare(`
    INSERT OR REPLACE INTO mission_runs
      (id, player_id, mission_id, planet_id, crew_size, mission_duration_days,
       days_survived, final_score, stars_earned, outcome, events_resolved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    authenticatedPlayerId,
    missionId,
    planetId,
    crewSize,
    missionDurationDays,
    daysSurvived,
    finalScore,
    starsEarned,
    outcome,
    eventsResolved ?? 0,
  )

  res.json({ ok: true })
})

// ── GET /leaderboard — top 10 by total_stars ─────────────────────────────────────

scoresRouter.get('/leaderboard', (_req: Request, res: Response): void => {
  const rows = db.prepare(`
    SELECT p.id as player_id, p.name, p.total_stars, p.current_level, p.commander_title
    FROM players p
    ORDER BY p.total_stars DESC
    LIMIT 10
  `).all() as LeaderboardEntry[]

  res.json(rows)
})

export default scoresRouter
