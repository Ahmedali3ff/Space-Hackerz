// Single serverless entry for every /api route that has no dedicated file (nested paths such as /api/missions/me).
import app from '../server/index.js'

export default app
