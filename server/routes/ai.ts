import { Router } from 'express'
import type { Request, Response } from 'express'
import { createLimiter } from '../lib/rate-limit.js'

export const aiRouter = Router()

// Server-side proxy for the Astro-AI assistant so the provider key never ships to the browser.
// Configure with AI_API_KEY (required), AI_API_ENDPOINT and AI_MODEL (optional).
const DEFAULT_ENDPOINT = 'https://api.openai.com/v1/chat/completions'
const DEFAULT_MODEL = 'gpt-4o-mini'
const MAX_PROMPT_CHARS = 6000
const isLimited = createLimiter(40, 10 * 60 * 1000)

aiRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const apiKey = process.env['AI_API_KEY']
  if (!apiKey) { res.status(503).json({ error: 'AI is not configured' }); return }

  if (isLimited(req.ip ?? 'unknown')) { res.status(429).json({ error: 'Too many requests' }); return }

  const prompt = (req.body as { prompt?: unknown }).prompt
  if (typeof prompt !== 'string' || prompt.length === 0 || prompt.length > MAX_PROMPT_CHARS) {
    res.status(400).json({ error: `prompt must be a string up to ${MAX_PROMPT_CHARS} characters` })
    return
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const upstream = await fetch(process.env['AI_API_ENDPOINT'] ?? DEFAULT_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env['AI_MODEL'] ?? DEFAULT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    })
    if (!upstream.ok) { res.status(502).json({ error: 'AI provider error' }); return }
    const data = (await upstream.json()) as { choices?: { message?: { content?: unknown } }[] }
    const content = data.choices?.[0]?.message?.content
    if (typeof content !== 'string') { res.status(502).json({ error: 'Invalid AI response' }); return }
    res.json({ content })
  } catch {
    res.status(502).json({ error: 'AI request failed' })
  } finally {
    clearTimeout(timer)
  }
})

export default aiRouter
