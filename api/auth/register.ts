import { randomBytes, randomUUID, scryptSync } from 'node:crypto'
import type { Request, Response } from 'express'
import { db } from '../../../server/db.js'

const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`
}

function createSession(accountId: string): string {
  const token = randomBytes(32).toString('hex')
  db.prepare("INSERT INTO sessions (token, account_id, expires_at) VALUES (?, ?, datetime('now', '+30 days'))").run(token, accountId)
  return token
}

export default function handler(req: Request, res: Response): void {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }
  const body = (req.body ?? {}) as { email?: unknown; password?: unknown; name?: unknown }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 6 || name.length < 2) { res.status(400).json({ error: 'Name, valid email and a password of at least 6 characters are required' }); return }
  try {
    const id = randomUUID()
    db.prepare('INSERT INTO accounts (id, email, password_hash) VALUES (?, ?, ?)').run(id, email, hashPassword(password))
    db.prepare('INSERT INTO players (id, account_id, name) VALUES (?, ?, ?)').run(`player-${id}`, id, name)
    const player = db.prepare('SELECT * FROM players WHERE account_id = ?').get(id)
    res.status(201).json({ token: createSession(id), account: { id, player } })
  } catch { res.status(409).json({ error: 'An account with this email already exists' }) }
}
