import { Router } from 'express'
import type { Request, Response } from 'express'
import { all, run } from '../db.js'
import type { MissionRunPayload, LeaderboardEntry } from '../types/api.types.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'

export const scoresRouter = Router()

// POST / — record a mission run
scoresRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const body = (req.body ?? {}) as Partial<MissionRunPayload>
  const { id, missionId, planetId, crewSize, missionDurationDays, daysSurvived, finalScore, starsEarned, outcome, eventsResolved } = body
  const playerId = `player-${req.userId as string}`

  if (
    typeof id !== 'string' || id.length === 0 || id.length > 100 ||
    typeof missionId !== 'string' || !/^m(0[1-9]|1[0-9]|20)$/.test(missionId) ||
    typeof planetId !== 'string' || typeof outcome !== 'string' || outcome.length > 50 ||
    typeof crewSize !== 'number' || !Number.isInteger(crewSize) || crewSize < 1 || crewSize > 100 ||
    typeof missionDurationDays !== 'number' || !Number.isInteger(missionDurationDays) || missionDurationDays < 1 || missionDurationDays > 365 ||
    typeof daysSurvived !== 'number' || !Number.isInteger(daysSurvived) || daysSurvived < 0 || daysSurvived > 1000 ||
    typeof finalScore !== 'number' || !Number.isFinite(finalScore) || Math.abs(finalScore) > 100000 ||
    typeof starsEarned !== 'number' || !Number.isInteger(starsEarned) || starsEarned < 0 || starsEarned > 3
  ) {
    res.status(400).json({ error: 'Missing or invalid required fields' })
    return
  }
  try {
    // Plain INSERT (not REPLACE): nobody can overwrite another player's run by reusing an id.
    await run(
      `INSERT INTO mission_runs
         (id, player_id, mission_id, planet_id, crew_size, mission_duration_days,
          days_survived, final_score, stars_earned, outcome, events_resolved)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, playerId, missionId, planetId, crewSize, missionDurationDays, daysSurvived, finalScore, starsEarned, outcome, eventsResolved ?? 0],
    )
  } catch {
    res.status(409).json({ error: 'Run already recorded' })
    return
  }
  res.json({ ok: true })
})

// GET /leaderboard — top 10 by total stars
scoresRouter.get('/leaderboard', async (_req: Request, res: Response): Promise<void> => {
  res.json(await all<LeaderboardEntry>(
    'SELECT p.id AS player_id, p.name, p.total_stars, p.current_level, p.commander_title FROM players p ORDER BY p.total_stars DESC LIMIT 10',
  ))
})

export default scoresRouter
