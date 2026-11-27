import type { Request, Response } from 'express'
import { createLimiter } from '../server/lib/rate-limit.js'
import { loginAccount, registerAccount } from '../server/lib/accounts.js'

const isLimited = createLimiter(20, 15 * 60 * 1000)

// Serverless function for /api/auth?mode=register|login. Same account store and rules as the Express routes.
export default function handler(req: Request, res: Response): void {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }
  if (isLimited(req.ip ?? 'unknown')) { res.status(429).json({ error: 'Too many attempts. Please try again later.' }); return }
  const mode = typeof req.query['mode'] === 'string' ? req.query['mode'] : ''
  const body = (req.body ?? {}) as Record<string, unknown>
  if (mode === 'register') { const r = registerAccount(body); res.status(r.status).json(r.body); return }
  if (mode === 'login') { const r = loginAccount(body); res.status(r.status).json(r.body); return }
  res.status(400).json({ error: 'Missing authentication mode' })
}
