// Vercel catch-all serverless entrypoint for the Express API.
import app from '../server/index.js'
import type { Request, Response } from 'express'

export default function handler(req: Request, res: Response): void {
  // The Vercel function may receive the path without /api.
  if (typeof req.url === 'string' && !req.url.startsWith('/api')) req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`
  app(req, res)
}
