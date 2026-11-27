import { Router } from 'express'
import type { Request, Response } from 'express'
import { db } from '../db.js'
import type { PlayerRecord, XPResult } from '../types/api.types.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import { getLevelForXP, MAX_XP_PER_AWARD } from '../lib/levels.js'

export const playersRouter = Router()

// ── Level thresholds (mirrors src/data/levels/level-definitions.ts) ────────────



// ── Ensure default player row exists ────────────────────────────────────────────

function ensurePlayer(accountId = 'legacy'): PlayerRecord {
  const existing = db
    .prepare('SELECT * FROM players WHERE id = ?')
    .get(accountId === 'legacy' ? 'player-1' : `player-${accountId}`) as PlayerRecord | undefined

  if (existing !== undefined) return existing

  db.prepare(`
    INSERT OR IGNORE INTO players (id, name, total_xp, current_level, commander_title, total_stars)
    VALUES (?, 'Commander', 0, 1, 'Space Cadet', 0)
  `).run(accountId === 'legacy' ? 'player-1' : `player-${accountId}`)

  return db
    .prepare('SELECT * FROM players WHERE id = ?')
    .get(accountId === 'legacy' ? 'player-1' : `player-${accountId}`) as PlayerRecord
}

// ── GET / — return single player ────────────────────────────────────────────────

playersRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const player = ensurePlayer(req.userId ?? 'legacy')
  res.json(player)
})

// ── POST / — upsert player name ──────────────────────────────────────────────────

playersRouter.post('/', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const name = (req.body as { name?: unknown }).name
  if (typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ error: 'name is required' })
    return
  }

  const playerId = `player-${req.userId as string}`
  db.prepare('UPDATE players SET name = ?, updated_at = datetime(\'now\') WHERE id = ?').run(name.trim(), playerId)

  const updated = db
    .prepare('SELECT * FROM players WHERE id = ?')
    .get(playerId) as PlayerRecord

  res.json(updated)
})

export default playersRouter
