import { Router } from 'express'
import type { Request, Response } from 'express'
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'
import { db } from '../db.js'

export const authRouter = Router()
const hashPassword = (password: string, salt = randomBytes(16).toString('hex')) => `${salt}:${scryptSync(password, salt, 64).toString('hex')}`
const verifyPassword = (password: string, stored: string): boolean => { const [salt, hash] = stored.split(':'); if (!salt || !hash) return false; const actual = scryptSync(password, salt, 64); return timingSafeEqual(actual, Buffer.from(hash, 'hex')) }
function createSession(accountId: string): string { const token = randomBytes(32).toString('hex'); db.prepare("INSERT INTO sessions (token, account_id, expires_at) VALUES (?, ?, datetime('now', '+30 days'))").run(token, accountId); return token }
function accountPayload(id: string): object { const player = db.prepare('SELECT * FROM players WHERE account_id = ?').get(id); return { id, player } }

authRouter.post('/register', (req: Request, res: Response): void => {
  const { email, password, name } = req.body as { email?: unknown; password?: unknown; name?: unknown }
  if (typeof email !== 'string' || !email.includes('@') || typeof password !== 'string' || password.length < 6 || typeof name !== 'string' || name.trim().length < 2) { res.status(400).json({ error: 'Name, valid email and a password of at least 6 characters are required' }); return }
  const id = randomUUID()
  try {
    db.prepare('INSERT INTO accounts (id, email, password_hash) VALUES (?, ?, ?)').run(id, email.trim().toLowerCase(), hashPassword(password))
    db.prepare('INSERT INTO players (id, account_id, name) VALUES (?, ?, ?)').run(`player-${id}`, id, name.trim())
    res.status(201).json({ token: createSession(id), account: accountPayload(id) })
  } catch { res.status(409).json({ error: 'An account with this email already exists' }) }
})

authRouter.post('/login', (req: Request, res: Response): void => {
  const { email, password } = req.body as { email?: unknown; password?: unknown }
  const account = typeof email === 'string' ? db.prepare('SELECT * FROM accounts WHERE email = ?').get(email.trim().toLowerCase()) as { id: string; password_hash: string } | undefined : undefined
  if (!account || typeof password !== 'string' || !verifyPassword(password, account.password_hash)) { res.status(401).json({ error: 'Invalid email or password' }); return }
  res.json({ token: createSession(account.id), account: accountPayload(account.id) })
})
