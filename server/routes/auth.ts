import { Router } from 'express'
import type { Request, Response } from 'express'
import { createLimiter } from '../lib/rate-limit.js'
import { loginAccount, registerAccount } from '../lib/accounts.js'

export const authRouter = Router()

// scrypt is CPU heavy: cap attempts per IP to blunt brute force and denial of service.
const isLimited = createLimiter(20, 15 * 60 * 1000)
function rateLimited(req: Request, res: Response): boolean {
  if (!isLimited(req.ip ?? 'unknown')) return false
  res.status(429).json({ error: 'Too many attempts. Please try again later.' })
  return true
}

authRouter.post('/register', (req: Request, res: Response): void => {
  if (rateLimited(req, res)) return
  const result = registerAccount((req.body ?? {}) as Record<string, unknown>)
  res.status(result.status).json(result.body)
})

authRouter.post('/login', (req: Request, res: Response): void => {
  if (rateLimited(req, res)) return
  const result = loginAccount((req.body ?? {}) as Record<string, unknown>)
  res.status(result.status).json(result.body)
})
