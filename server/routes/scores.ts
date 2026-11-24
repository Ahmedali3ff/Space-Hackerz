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
    typeof missionId !== 'string' ||
    typeof planetId !== 'string' ||
    typeof crewSize !== 'number' ||
    typeof missionDurationDays !== 'number' ||
    typeof daysSurvived !== 'number' ||
    typeof finalScore !== 'number' ||
    typeof starsEarned !== 'number' ||
    typeof outcome !== 'string' ||
    !Number.isInteger(starsEarned) || starsEarned < 0 || starsEarned > 3 ||
    !Number.isInteger(crewSize) || crewSize < 1 || crewSize > 100 ||
    !Number.isInteger(missionDurationDays) || missionDurationDays < 1 || missionDurationDays > 365 ||
    !Number.isInteger(daysSurvived) || daysSurvived < 0 || daysSurvived > 1000 ||
    !Number.isFinite(finalScore) || Math.abs(finalScore) > 100000 ||
    id.length > 100 || outcome.length > 50
  ) {
    res.status(400).json({ error: 'Missing or invalid required fields' })
    return
  }

  try {
  db.prepare(`
    INSERT INTO mission_runs
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
  } catch {
    res.status(409).json({ error: 'Run already recorded' })
    return
  }

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
