import { Router } from 'express'
import type { Response } from 'express'
import { one, run } from '../db.js'
import type { PlayerRecord } from '../types/api.types.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'

export const playersRouter = Router()

async function ensurePlayer(accountId: string): Promise<PlayerRecord> {
  const id = `player-${accountId}`
  await run("INSERT OR IGNORE INTO players (id, account_id, name) VALUES (?, ?, 'Commander')", [id, accountId])
  return (await one<PlayerRecord>('SELECT * FROM players WHERE id = ?', [id])) as PlayerRecord
}

// GET / — the authenticated player
playersRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.json(await ensurePlayer(req.userId as string))
})

// POST / — change the player's name
playersRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const name = (req.body as { name?: unknown } | undefined)?.name
  if (typeof name !== 'string' || name.trim().length === 0 || name.length > 60) {
    res.status(400).json({ error: 'name is required (max 60 characters)' })
    return
  }
  const player = await ensurePlayer(req.userId as string)
  await run("UPDATE players SET name = ?, updated_at = datetime('now') WHERE id = ?", [name.trim(), player.id])
  res.json(await one<PlayerRecord>('SELECT * FROM players WHERE id = ?', [player.id]))
})

export default playersRouter
