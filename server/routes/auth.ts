import { Router } from 'express'
import type { Request, Response } from 'express'
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'
import { db } from '../db.js'

export const authRouter = Router()
const hashPassword = (password: string, salt = randomBytes(16).toString('hex')) => `${salt}:${scryptSync(password, salt, 64).toString('hex')}`
const verifyPassword = (password: string, stored: string): boolean => {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  try {
    const expected = Buffer.from(hash, 'hex')
    const actual = scryptSync(password, salt, 64)
    // timingSafeEqual throws if lengths differ (e.g. corrupted row) -> treat as a failed login, not a 500
    return expected.length === actual.length && timingSafeEqual(actual, expected)
  } catch { return false }
}
const EMAIL_RE = /^\S+@\S+\.\S+$/

// Minimal in-memory rate limiter: scrypt is CPU heavy, so cap attempts per IP to blunt brute force / DoS.
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 20
const attempts = new Map<string, { count: number; resetAt: number }>()
function rateLimited(req: Request, res: Response): boolean {
  const key = req.ip ?? 'unknown'
  const now = Date.now()
  const entry = attempts.get(key)
  if (!entry || entry.resetAt < now) { attempts.set(key, { count: 1, resetAt: now + WINDOW_MS }); return false }
  entry.count += 1
  if (entry.count > MAX_ATTEMPTS) { res.status(429).json({ error: 'Too many attempts. Please try again later.' }); return true }
  return false
}
function createSession(accountId: string): string { const token = randomBytes(32).toString('hex'); db.prepare("INSERT INTO sessions (token, account_id, expires_at) VALUES (?, ?, datetime('now', '+30 days'))").run(token, accountId); return token }
function accountPayload(id: string): object { const player = db.prepare('SELECT * FROM players WHERE account_id = ?').get(id); return { id, player } }

authRouter.post('/register', (req: Request, res: Response): void => {
  if (rateLimited(req, res)) return
  const { email, password, name } = req.body as { email?: unknown; password?: unknown; name?: unknown }
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim()) || typeof password !== 'string' || password.length < 6 || typeof name !== 'string' || name.trim().length < 2) { res.status(400).json({ error: 'Name, valid email and a password of at least 6 characters are required' }); return }
  const id = randomUUID()
  try {
    db.prepare('INSERT INTO accounts (id, email, password_hash) VALUES (?, ?, ?)').run(id, email.trim().toLowerCase(), hashPassword(password))
    db.prepare('INSERT INTO players (id, account_id, name) VALUES (?, ?, ?)').run(`player-${id}`, id, name.trim())
    res.status(201).json({ token: createSession(id), account: accountPayload(id) })
  } catch { res.status(409).json({ error: 'An account with this email already exists' }) }
})

authRouter.post('/login', (req: Request, res: Response): void => {
  if (rateLimited(req, res)) return
  const { email, password } = req.body as { email?: unknown; password?: unknown }
  const account = typeof email === 'string' ? db.prepare('SELECT * FROM accounts WHERE email = ?').get(email.trim().toLowerCase()) as { id: string; password_hash: string } | undefined : undefined
  if (!account || typeof password !== 'string' || !verifyPassword(password, account.password_hash)) { res.status(401).json({ error: 'Invalid email or password' }); return }
  res.json({ token: createSession(account.id), account: accountPayload(account.id) })
})
