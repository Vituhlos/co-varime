import { Router } from 'express'
import Database from 'better-sqlite3'
import { mkdirSync } from 'fs'
import { join } from 'path'
import { broadcast } from '../websocket.js'

const DATA_DIR = process.env.DATA_DIR || (process.platform === 'win32' ? './data' : '/app/data')
mkdirSync(DATA_DIR, { recursive: true })
const db = new Database(join(DATA_DIR, 'votes.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS proposals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT,
    image TEXT,
    proposed_by TEXT DEFAULT 'J',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    active INTEGER DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proposal_id INTEGER NOT NULL,
    member TEXT NOT NULL,
    vote TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(proposal_id, member)
  );
`)

const router = Router()

// GET /api/vote/active
router.get('/active', (req, res) => {
  const proposal = db.prepare('SELECT * FROM proposals WHERE active = 1 ORDER BY created_at DESC LIMIT 1').get()
  if (!proposal) return res.json(null)

  const voteRows = db.prepare('SELECT member, vote FROM votes WHERE proposal_id = ?').all(proposal.id)
  const votes = {}
  for (const row of voteRows) votes[row.member] = row.vote

  res.json({ ...proposal, votes })
})

// POST /api/vote/propose
router.post('/propose', (req, res) => {
  const { recipe } = req.body
  if (!recipe?.title) return res.status(400).json({ error: 'Recipe required' })

  // Deactivate old proposals
  db.prepare('UPDATE proposals SET active = 0 WHERE active = 1').run()

  const proposedBy = req.body.proposedBy || 'J'
  const result = db.prepare(
    'INSERT INTO proposals (title, url, image, proposed_by) VALUES (?, ?, ?, ?)'
  ).run(recipe.title, recipe.url || null, recipe.image || null, proposedBy)

  const proposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(result.lastInsertRowid)
  broadcast({ type: 'proposal_new', proposal })
  res.json(proposal)
})

// POST /api/vote/:id
router.post('/:id', (req, res) => {
  const { vote, member = 'J' } = req.body
  const proposalId = parseInt(req.params.id)

  if (!['yes', 'no'].includes(vote)) return res.status(400).json({ error: 'Vote must be yes or no' })

  db.prepare(
    'INSERT OR REPLACE INTO votes (proposal_id, member, vote) VALUES (?, ?, ?)'
  ).run(proposalId, member, vote)

  const voteRows = db.prepare('SELECT member, vote FROM votes WHERE proposal_id = ?').all(proposalId)
  const votes = {}
  for (const row of voteRows) votes[row.member] = row.vote

  broadcast({ type: 'vote_updated', proposalId, votes })
  res.json({ votes })
})

// DELETE /api/vote/active
router.delete('/active', (req, res) => {
  db.prepare('UPDATE proposals SET active = 0 WHERE active = 1').run()
  broadcast({ type: 'proposal_closed' })
  res.json({ ok: true })
})

export default router
