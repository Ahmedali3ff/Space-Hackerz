// server/lib/rewards.ts
// Server-side mission rewards. The client reports which mission it finished and how many stars it earned;
// the XP is calculated here, so a client cannot choose its own reward.
import { withTransaction, txAll } from '../db.js'
import { getLevelForXP } from './levels.js'

/** Same formula as getXPForMission in src/data/levels/level-definitions.ts (kept in sync by a test). */
export function xpForMission(stars: number, missionNumber: number): number {
  return stars * 20 + missionNumber * 10
}

export interface CompleteResult { readonly status: number; readonly body: Record<string, unknown> }

const MISSION_ID_RE = /^m(0[1-9]|1[0-9]|20)$/

export async function completeMission(accountId: string, input: { missionId?: unknown; starsEarned?: unknown }): Promise<CompleteResult> {
  const missionId = typeof input.missionId === 'string' ? input.missionId : ''
  const stars = input.starsEarned
  if (!MISSION_ID_RE.test(missionId) || typeof stars !== 'number' || !Number.isInteger(stars) || stars < 1 || stars > 3) {
    return { status: 400, body: { error: 'missionId (m01–m20) and starsEarned (1–3) are required' } }
  }
  const missionNumber = Number(missionId.slice(1))
  const playerId = `player-${accountId}`
  const now = new Date().toISOString()

  return withTransaction(async (t): Promise<CompleteResult> => {
    await t.execute({ sql: "INSERT OR IGNORE INTO players (id, account_id, name) VALUES (?, ?, 'Commander')", args: [playerId, accountId] })
    const previous = (await txAll<{ status: string; stars_earned: number; completed_at: string | null }>(
      t,
      'SELECT status, stars_earned, completed_at FROM mission_progress WHERE player_id = ? AND mission_id = ?',
      [playerId, missionId],
    ))[0]
    const wasCompleted = previous?.status === 'completed'
    const previousStars = wasCompleted ? previous.stars_earned : 0
    const best = Math.max(previousStars, stars)
    // First clear grants the full XP. A replay only grants XP for stars it newly adds.
    const awardedXP = wasCompleted
      ? xpForMission(best, missionNumber) - xpForMission(previousStars, missionNumber)
      : xpForMission(best, missionNumber)

    await t.execute({
      sql: `INSERT INTO mission_progress (player_id, mission_id, status, tasks_complete, stars_earned, completed_at)
            VALUES (?, ?, 'completed', '[]', ?, ?)
            ON CONFLICT(player_id, mission_id) DO UPDATE SET
              status = 'completed',
              stars_earned = MAX(mission_progress.stars_earned, excluded.stars_earned),
              completed_at = COALESCE(mission_progress.completed_at, excluded.completed_at)`,
      args: [playerId, missionId, best, previous?.completed_at ?? now],
    })

    const totals = (await txAll<{ stars: number }>(t, 'SELECT COALESCE(SUM(stars_earned), 0) AS stars FROM mission_progress WHERE player_id = ?', [playerId]))[0]
    const player = (await txAll<{ total_xp: number }>(t, 'SELECT total_xp FROM players WHERE id = ?', [playerId]))[0]
    const newXP = (player?.total_xp ?? 0) + awardedXP
    const level = getLevelForXP(newXP)
    await t.execute({
      sql: "UPDATE players SET total_xp = ?, current_level = ?, commander_title = ?, total_stars = ?, updated_at = datetime('now') WHERE id = ?",
      args: [newXP, level.level, level.title, totals?.stars ?? 0, playerId],
    })

    return { status: 200, body: { awardedXP, starsEarned: best, totalXP: newXP, level: level.level, title: level.title } }
  })
}

