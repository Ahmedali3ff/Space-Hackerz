import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'
import type { Request, Response } from 'express'

interface Account { id: string; email: string; passwordHash: string; player: Record<string, unknown> }
interface AuthState { accounts: Map<string, Account>; sessions: Map<string, string> }
const globalState = globalThis as typeof globalThis & { __spaceHackerzAuth?: AuthState }
const state: AuthState = globalState.__spaceHackerzAuth ?? { accounts: new Map(), sessions: new Map() }
globalState.__spaceHackerzAuth = state

function hashPassword(password: string, salt = randomBytes(16).toString('hex')): string { return `${salt}:${scryptSync(password, salt, 64).toString('hex')}` }
function verifyPassword(password: string, stored: string): boolean { const [salt, hash] = stored.split(':'); if (!salt || !hash) return false; try { return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, 'hex')) } catch { return false } }
function responseFor(account: Account): { token: string; account: { id: string; player: Record<string, unknown> } } { const token = randomBytes(32).toString('hex'); state.sessions.set(token, account.id); return { token, account: { id: account.id, player: account.player } } }

export default function handler(req: Request, res: Response): void {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }
  const mode = typeof req.query.mode === 'string' ? req.query.mode : ''
  const body = (req.body ?? {}) as { email?: unknown; password?: unknown; name?: unknown }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  if (mode === 'register') {
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 6 || name.length < 2) { res.status(400).json({ error: 'Name, valid email and a password of at least 6 characters are required' }); return }
    if (state.accounts.has(email)) { res.status(409).json({ error: 'An account with this email already exists' }); return }
    const id = randomUUID()
    const player = { id: `player-${id}`, name, total_xp: 0, current_level: 1, commander_title: 'Space Cadet', total_stars: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    const account: Account = { id, email, passwordHash: hashPassword(password), player }
    state.accounts.set(email, account)
    res.status(201).json(responseFor(account)); return
  }
  if (mode === 'login') {
    const account = state.accounts.get(email)
    if (!account || !verifyPassword(password, account.passwordHash)) { res.status(401).json({ error: 'Invalid email or password' }); return }
    res.status(200).json(responseFor(account)); return
  }
  res.status(400).json({ error: 'Missing authentication mode' })
}
