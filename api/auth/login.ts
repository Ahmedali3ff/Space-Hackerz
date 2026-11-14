import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { Request, Response } from 'express'
import { db } from '../../../server/db.js'

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  try { return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, 'hex')) } catch { return false }
}

function createSession(accountId: string): string {
  const token = randomBytes(32).toString('hex')
  db.prepare("INSERT INTO sessions (token, account_id, expires_at) VALUES (?, ?, datetime('now', '+30 days'))").run(token, accountId)
  return token
}

export default function handler(req: Request, res: Response): void {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }
  const body = (req.body ?? {}) as { email?: unknown; password?: unknown }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const account = db.prepare('SELECT * FROM accounts WHERE email = ?').get(email) as { id: string; password_hash: string } | undefined
  if (!account || !verifyPassword(password, account.password_hash)) { res.status(401).json({ error: 'Invalid email or password' }); return }
  const player = db.prepare('SELECT * FROM players WHERE account_id = ?').get(account.id)
  res.status(200).json({ token: createSession(account.id), account: { id: account.id, player } })
}
