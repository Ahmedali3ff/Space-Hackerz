// server/lib/accounts.ts
// The single account store for both the Express routes and the /api/auth function.
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'
import { batch, one } from '../db.js'
import { signToken } from './token.js'

export const EMAIL_RE = /^\S+@\S+\.\S+$/
export const MIN_PASSWORD_LENGTH = 8

export interface AuthResult { readonly status: number; readonly body: Record<string, unknown> }

/** Returns a message when the password is too weak, otherwise null. */
export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return 'Password must contain at least one letter and one number'
  return null
}

const hashPassword = (password: string, salt = randomBytes(16).toString('hex')): string =>
  `${salt}:${scryptSync(password, salt, 64).toString('hex')}`

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  try {
    const expected = Buffer.from(hash, 'hex')
    const actual = scryptSync(password, salt, 64)
    // A corrupted row must be a failed login, not a 500.
    return expected.length === actual.length && timingSafeEqual(actual, expected)
  } catch { return false }
}

async function accountPayload(id: string): Promise<{ id: string; player: unknown }> {
  return { id, player: await one('SELECT * FROM players WHERE account_id = ?', [id]) }
}

export async function registerAccount(input: { email?: unknown; password?: unknown; name?: unknown }): Promise<AuthResult> {
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
  const password = typeof input.password === 'string' ? input.password : ''
  const name = typeof input.name === 'string' ? input.name.trim() : ''
  if (!EMAIL_RE.test(email) || name.length < 2) {
    return { status: 400, body: { error: 'Name and a valid email are required' } }
  }
  const problem = passwordProblem(password)
  if (problem) return { status: 400, body: { error: problem } }

  const id = randomUUID()
  try {
    await batch([
      { sql: 'INSERT INTO accounts (id, email, password_hash) VALUES (?, ?, ?)', args: [id, email, hashPassword(password)] },
      { sql: 'INSERT INTO players (id, account_id, name) VALUES (?, ?, ?)', args: [`player-${id}`, id, name] },
    ])
  } catch {
    return { status: 409, body: { error: 'An account with this email already exists' } }
  }
  return { status: 201, body: { token: signToken(id), account: await accountPayload(id) } }
}

export async function loginAccount(input: { email?: unknown; password?: unknown }): Promise<AuthResult> {
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
  const password = typeof input.password === 'string' ? input.password : ''
  const account = email ? await one<{ id: string; password_hash: string }>('SELECT id, password_hash FROM accounts WHERE email = ?', [email]) : undefined
  if (!account || !verifyPassword(password, account.password_hash)) {
    return { status: 401, body: { error: 'Invalid email or password' } }
  }
  return { status: 200, body: { token: signToken(account.id), account: await accountPayload(account.id) } }
}
