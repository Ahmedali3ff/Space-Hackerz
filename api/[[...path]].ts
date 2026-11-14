// Vercel serverless entrypoint for the Express API.
import app from '../server/index.js'
import type { Request, Response } from 'express'

// Vercel strips the /api prefix before invoking a catch-all function in some
// runtimes. Restore it so the Express routers mounted at /api/* receive POST
// requests correctly instead of falling through to the SPA rewrite (405).
export default function handler(req: Request, res: Response): void {
  if (typeof req.url === 'string' && !req.url.startsWith('/api')) req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`
  app(req, res)
}
