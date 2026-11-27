// server/lib/rewards.ts
// Server-side mission rewards. The client reports only WHICH mission it finished and HOW MANY stars it earned;
// the XP is calculated here, so a client cannot choose its own reward.
import { db } from '../db.js'
import { getLevelForXP } from './levels.js'

/** Same formula as getXPForMission in src/data/levels/level-definitions.ts (kept in sync by a test). */
export function xpForMission(stars: number, missionNumber: number): number {
  return stars * 20 + missionNumber * 10
}

export interface CompleteResult { readonly status: number; readonly body: Record<string, unknown> }

const MISSION_ID_RE = /^m(0[1-9]|1[0-9]|20)$/

export function completeMission(accountId: string, input: { missionId?: unknown; starsEarned?: unknown }): CompleteResult {
  const missionId = typeof input.missionId === 'string' ? input.missionId : ''
  const stars = input.starsEarned
  if (!MISSION_ID_RE.test(missionId) || typeof stars !== 'number' || !Number.isInteger(stars) || stars < 1 || stars > 3) {
    return { status: 400, body: { error: 'missionId (m01–m20) and starsEarned (1–3) are required' } }
  }
  const missionNumber = Number(missionId.slice(1))
  const playerId = `player-${accountId}`
  const now = new Date().toISOString()

  const run = db.transaction((): CompleteResult => {
    db.prepare("INSERT OR IGNORE INTO players (id, account_id, name) VALUES (?, ?, 'Commander')").run(playerId, accountId)
    const previous = db.prepare('SELECT status, stars_earned, completed_at FROM mission_progress WHERE player_id = ? AND mission_id = ?')
      .get(playerId, missionId) as { status: string; stars_earned: number; completed_at: string | null } | undefined
    const wasCompleted = previous?.status === 'completed'
    const previousStars = wasCompleted ? previous.stars_earned : 0
    const best = Math.max(previousStars, stars)
    // First clear grants the full XP. A replay only grants XP for stars it newly adds.
    const awardedXP = wasCompleted
      ? xpForMission(best, missionNumber) - xpForMission(previousStars, missionNumber)
      : xpForMission(best, missionNumber)

    db.prepare(`INSERT INTO mission_progress (player_id, mission_id, status, tasks_complete, stars_earned, completed_at)
                VALUES (?, ?, 'completed', '[]', ?, ?)
                ON CONFLICT(player_id, mission_id) DO UPDATE SET
                  status = 'completed',
                  stars_earned = MAX(mission_progress.stars_earned, excluded.stars_earned),
                  completed_at = COALESCE(mission_progress.completed_at, excluded.completed_at)`)
      .run(playerId, missionId, best, previous?.completed_at ?? now)

    const totals = db.prepare('SELECT COALESCE(SUM(stars_earned), 0) AS stars FROM mission_progress WHERE player_id = ?').get(playerId) as { stars: number }
    const player = db.prepare('SELECT total_xp FROM players WHERE id = ?').get(playerId) as { total_xp: number }
    const newXP = player.total_xp + awardedXP
    const level = getLevelForXP(newXP)
    db.prepare("UPDATE players SET total_xp = ?, current_level = ?, commander_title = ?, total_stars = ?, updated_at = datetime('now') WHERE id = ?")
      .run(newXP, level.level, level.title, totals.stars, playerId)

    return { status: 200, body: { awardedXP, starsEarned: best, totalXP: newXP, level: level.level, title: level.title } }
  })
  return run()
}
