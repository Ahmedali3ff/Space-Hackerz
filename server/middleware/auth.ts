import type { NextFunction, Request, Response } from 'express'
import { db } from '../db.js'

export interface AuthenticatedRequest extends Request { userId?: string }

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) { res.status(401).json({ error: 'Authentication required' }); return }
  const session = db.prepare("SELECT account_id FROM sessions WHERE token = ? AND expires_at > datetime('now')").get(token) as { account_id: string } | undefined
  if (!session) { res.status(401).json({ error: 'Session expired' }); return }
  req.userId = session.account_id
  next()
}
