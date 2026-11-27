import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

// Stateless signed session tokens: valid on any server instance that shares AUTH_SECRET,
// so tokens survive serverless cold starts and work across /api/auth and the Express routes.
const SECRET = process.env['AUTH_SECRET'] ?? randomBytes(32).toString('hex')
if (process.env['AUTH_SECRET'] === undefined && process.env['NODE_ENV'] === 'production') {
  console.warn('AUTH_SECRET is not set: signed tokens will not be valid across server instances.')
}
const TTL_MS = 30 * 24 * 60 * 60 * 1000

const sign = (data: string): string => createHmac('sha256', SECRET).update(data).digest('base64url')

export function signToken(accountId: string): string {
  const payload = Buffer.from(JSON.stringify({ sub: accountId, exp: Date.now() + TTL_MS })).toString('base64url')
  return `st1.${payload}.${sign(payload)}`
}

/** Returns the account id for a valid, unexpired signed token, otherwise null. */
export function verifyToken(token: string): string | null {
  const parts = token.split('.')
  if (parts.length !== 3 || parts[0] !== 'st1') return null
  const [, payload, sig] = parts as [string, string, string]
  const expected = Buffer.from(sign(payload))
  const actual = Buffer.from(sig)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null
  try {
    const { sub, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { sub?: unknown; exp?: unknown }
    return typeof sub === 'string' && typeof exp === 'number' && exp > Date.now() ? sub : null
  } catch { return null }
}
