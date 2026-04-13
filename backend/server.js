import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
import searchRouter from './routes/search.js'
import mealieRouter from './routes/mealie.js'
import productsRouter from './routes/products.js'
import voteRouter from './routes/vote.js'
import configRouter from './routes/config.js'
import { initWebSocket } from './websocket.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api/search', searchRouter)
app.use('/api/mealie', mealieRouter)
app.use('/api/products', productsRouter)
app.use('/api/vote', voteRouter)
app.use('/api/config', configRouter)

app.get('/health', (_, res) => res.json({ ok: true }))

// Serve frontend static files
const frontendDist = join(__dirname, '../frontend/dist')
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist))
  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(join(frontendDist, 'index.html'))
  })
}

const server = createServer(app)
initWebSocket(server)

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})
