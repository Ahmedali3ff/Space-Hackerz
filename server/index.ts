import express from 'express'
import cors from 'cors'
import playersRouter from './routes/players.js'
import missionsRouter from './routes/missions.js'
import scoresRouter from './routes/scores.js'

const app = express()
const PORT = process.env['PORT'] ?? 3001

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }))
app.use(express.json())

app.use('/api/players', playersRouter)
app.use('/api/missions', missionsRouter)
app.use('/api/scores', scoresRouter)

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'Space+ API' }))

app.listen(Number(PORT), () => console.log(`🚀 Space+ API running at http://localhost:${PORT}`))
