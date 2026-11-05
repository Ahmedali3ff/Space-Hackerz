import { Router } from 'express'
import type { Request, Response } from 'express'
import { db } from '../db.js'
import type { PlayerRecord, XPResult } from '../types/api.types.js'

export const playersRouter = Router()

// ── Level thresholds (mirrors src/data/levels/level-definitions.ts) ────────────
interface LevelDef {
  level: number
  title: string
  minXP: number
}

const LEVEL_DEFS: readonly LevelDef[] = [
  { level: 1, title: 'Space Cadet',    minXP: 0    },
  { level: 2, title: 'Explorer',       minXP: 100  },
  { level: 3, title: 'Star Explorer',  minXP: 300  },
  { level: 4, title: 'Mission Expert', minXP: 600  },
  { level: 5, title: 'Commander',      minXP: 1000 },
  { level: 6, title: 'Admiral',        minXP: 1500 },
]

function getLevelForXP(xp: number): LevelDef {
  // Walk backwards to find highest threshold not exceeding xp
  for (let i = LEVEL_DEFS.length - 1; i >= 0; i--) {
    const def = LEVEL_DEFS[i]
    if (def !== undefined && xp >= def.minXP) return def
  }
  return LEVEL_DEFS[0] as LevelDef
}

// ── Ensure default player row exists ────────────────────────────────────────────

function ensurePlayer(): PlayerRecord {
  const existing = db
    .prepare('SELECT * FROM players WHERE id = ?')
    .get('player-1') as PlayerRecord | undefined

  if (existing !== undefined) return existing

  db.prepare(`
    INSERT OR IGNORE INTO players (id, name, total_xp, current_level, commander_title, total_stars)
    VALUES ('player-1', 'Commander', 0, 1, 'Space Cadet', 0)
  `).run()

  return db
    .prepare('SELECT * FROM players WHERE id = ?')
    .get('player-1') as PlayerRecord
}

// ── GET / — return single player ────────────────────────────────────────────────

playersRouter.get('/', (_req: Request, res: Response): void => {
  const player = ensurePlayer()
  res.json(player)
})

// ── POST / — upsert player name ──────────────────────────────────────────────────

playersRouter.post('/', (req: Request, res: Response): void => {
  const name = (req.body as { name?: unknown }).name
  if (typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ error: 'name is required' })
    return
  }

  db.prepare(`
    INSERT INTO players (id, name, updated_at)
    VALUES ('player-1', ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET name = excluded.name, updated_at = excluded.updated_at
  `).run(name.trim())

  const updated = db
    .prepare('SELECT * FROM players WHERE id = ?')
    .get('player-1') as PlayerRecord

  res.json(updated)
})

// ── PATCH /xp — add XP and recompute level ───────────────────────────────────────

playersRouter.patch('/xp', (req: Request, res: Response): void => {
  const amount = (req.body as { amount?: unknown }).amount
  if (typeof amount !== 'number' || !isFinite(amount)) {
    res.status(400).json({ error: 'amount must be a finite number' })
    return
  }

  const player = ensurePlayer()
  const prevLevel = player.current_level
  const newXP = player.total_xp + amount
  const levelDef = getLevelForXP(newXP)

  db.prepare(`
    UPDATE players
    SET total_xp = ?, current_level = ?, commander_title = ?, updated_at = datetime('now')
    WHERE id = 'player-1'
  `).run(newXP, levelDef.level, levelDef.title)

  const result: XPResult = {
    newXP,
    newLevel: levelDef.level,
    leveledUp: levelDef.level > prevLevel,
    newTitle: levelDef.title,
  }
  res.json(result)
})

export default playersRouter
