import { Router } from 'express'
import { getConfig, updateConfig } from '../config.js'

const router = Router()

// GET /api/config — vrátí konfiguraci (API klíče maskované)
router.get('/', (req, res) => {
  const cfg = getConfig()
  res.json({
    mealieUrl: cfg.mealieUrl,
    mealieApiKey: cfg.mealieApiKey ? '••••••••' : '',
    mealieApiKeySet: !!cfg.mealieApiKey,
    anthropicApiKey: cfg.anthropicApiKey ? '••••••••' : '',
    anthropicApiKeySet: !!cfg.anthropicApiKey,
    defaultServings: cfg.defaultServings,
    members: cfg.members,
  })
})

// PUT /api/config — uloží konfiguraci
router.put('/', (req, res) => {
  const { mealieUrl, mealieApiKey, anthropicApiKey, defaultServings, members } = req.body
  const patch = {}

  if (mealieUrl !== undefined) patch.mealieUrl = mealieUrl
  // Only update keys if they're not masked placeholders
  if (mealieApiKey !== undefined && mealieApiKey !== '••••••••') patch.mealieApiKey = mealieApiKey
  if (anthropicApiKey !== undefined && anthropicApiKey !== '••••••••') patch.anthropicApiKey = anthropicApiKey
  if (defaultServings !== undefined) patch.defaultServings = defaultServings
  if (members !== undefined) patch.members = members

  const updated = updateConfig(patch)
  res.json({ ok: true, mealieUrl: updated.mealieUrl, defaultServings: updated.defaultServings, members: updated.members })
})

export default router
