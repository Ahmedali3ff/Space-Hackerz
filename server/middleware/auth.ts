import type { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../lib/token.js'

export interface AuthenticatedRequest extends Request { userId?: string }

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) { res.status(401).json({ error: 'Authentication required' }); return }
  const accountId = verifyToken(token)
  if (accountId === null) { res.status(401).json({ error: 'Session expired' }); return }
  req.userId = accountId
  next()
}
