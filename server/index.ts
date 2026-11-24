import express from 'express'
import cors from 'cors'
import playersRouter from './routes/players.js'
import missionsRouter from './routes/missions.js'
import scoresRouter from './routes/scores.js'
import { authRouter } from './routes/auth.js'
import { aiRouter } from './routes/ai.js'

const app = express()
const PORT = process.env['PORT'] ?? 3001

const ALLOWED_ORIGINS = (process.env['CORS_ORIGINS'] ?? 'http://localhost:5173,http://localhost:4173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)
app.use(cors({ origin: ALLOWED_ORIGINS }))
app.use(express.json({ limit: '100kb' }))

app.use('/api/auth', authRouter)
app.use('/api/players', playersRouter)
app.use('/api/missions', missionsRouter)
app.use('/api/scores', scoresRouter)
app.use('/api/ai', aiRouter)

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'Space+ API' }))

if (process.env['VERCEL'] !== '1') app.listen(Number(PORT), () => console.log('Space+ API running'))

export default app
