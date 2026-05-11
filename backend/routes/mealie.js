import { Router } from 'express'
import { getConfig } from '../config.js'

const router = Router()

function getMealieConfig() {
  const cfg = getConfig()
  return {
    url: (cfg.mealieUrl || '').replace(/\/+$/, ''),
    key: cfg.mealieApiKey || '',
  }
}

function mealieHeaders() {
  const { key } = getMealieConfig()
  return {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
}

async function mealieRequest(path, options = {}) {
  const { url } = getMealieConfig()
  const res = await fetch(`${url}/api${path}`, {
    ...options,
    headers: { ...mealieHeaders(), ...options.headers },
  })
  if (!res.ok) {
    let detail = ''
    try {
      detail = await res.text()
    } catch {}
    throw new Error(`Mealie error ${res.status}: ${path}${detail ? ` - ${detail}` : ''}`)
  }

  if (res.status === 204) return null

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return res.json()
  return res.text()
}

// GET /api/mealie/recipes
router.get('/recipes', async (req, res) => {
  try {
    const data = await mealieRequest('/recipes?page=1&perPage=100')
    res.json(data)
  } catch (err) {
    console.error('[Mealie] recipes error:', err.message)
    res.json({ items: [] })
  }
})

// POST /api/mealie/recipes — import from URL
router.post('/recipes', async (req, res) => {
  const { url } = req.body
  if (!url) return res.status(400).json({ error: 'URL je povinné' })
  try {
    const data = await mealieRequest('/recipes/create/url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    })
    res.json(data)
  } catch (err) {
    console.error('[Mealie] create recipe error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/mealie/history
router.get('/history', async (req, res) => {
  try {
    const data = await mealieRequest('/groups/mealplans?page=1&perPage=50')
    const items = (data.items || []).map(plan => ({
      id: plan.id,
      name: plan.recipe?.name || plan.title,
      image: plan.recipe?.image ? `${getMealieConfig().url}/api/media/recipes/${plan.recipe.id}/images/min-original.webp` : null,
      date: plan.date,
      cookedAt: plan.date,
      cookedBy: plan.recipe?.extras?.cookedBy ? JSON.parse(plan.recipe.extras.cookedBy) : ['J'],
    }))
    res.json(items.reverse())
  } catch (err) {
    console.error('[Mealie] history error:', err.message)
    res.json([])
  }
})

// GET /api/mealie/shopping
router.get('/shopping', async (req, res) => {
  try {
    const data = await mealieRequest('/groups/shopping/lists')
    const lists = data.items || []
    if (lists.length === 0) return res.json([])
    const list = await mealieRequest(`/groups/shopping/lists/${lists[0].id}`)
    const items = (list.listItems || []).map(item => ({
      ...item,
      group: item.recipeReferences?.[0]?.name || item.label?.name || 'Ostatní',
    }))
    res.json(items)
  } catch (err) {
    console.error('[Mealie] shopping error:', err.message)
    res.json([])
  }
})

// POST /api/mealie/shopping
router.post('/shopping', async (req, res) => {
  const { name, quantity, unit, note, group } = req.body
  try {
    const lists = await mealieRequest('/groups/shopping/lists')
    const listId = lists.items?.[0]?.id
    if (!listId) return res.status(404).json({ error: 'Žádný nákupní seznam' })

    const item = await mealieRequest(`/groups/shopping/lists/${listId}/items`, {
      method: 'POST',
      body: JSON.stringify({ note: name, quantity, unit, checked: false }),
    })
    res.json({ ...item, name, group: group || 'Ostatní' })
  } catch (err) {
    console.error('[Mealie] add shopping item error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/mealie/shopping/:id
router.put('/shopping/:id', async (req, res) => {
  try {
    const data = await mealieRequest(`/groups/shopping/items/${req.params.id}`, {
      method: 'PUT',
      body: JSON.stringify(req.body),
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/mealie/shopping/:id
router.delete('/shopping/:id', async (req, res) => {
  try {
    await mealieRequest(`/groups/shopping/items/${req.params.id}`, { method: 'DELETE' })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/mealie/recipes/:slug/favorite
router.patch('/recipes/:slug/favorite', async (req, res) => {
  const { slug } = req.params
  const { favorite } = req.body
  try {
    const recipe = await mealieRequest(`/recipes/${slug}`)
    await mealieRequest(`/recipes/${slug}`, {
      method: 'PATCH',
      body: JSON.stringify({ settings: { ...recipe.settings, isFavorite: favorite } }),
    })
    res.json({ ok: true })
  } catch (err) {
    console.error('[Mealie] favorite error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/mealie/test
router.post('/test', async (req, res) => {
  const cfg = getConfig()
  const url = (req.body?.url || cfg.mealieUrl || '').replace(/\/+$/, '')
  const apiKey = req.body?.apiKey || cfg.mealieApiKey

  if (!url) return res.status(400).json({ ok: false, error: 'Chybí Mealie URL' })
  if (!apiKey) return res.status(400).json({ ok: false, error: 'Chybí Mealie API klíč' })

  try {
    const r = await fetch(`${url}/api/app/about`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })
    let detail = ''
    try {
      detail = await r.text()
    } catch {}
    res.status(r.ok ? 200 : 502).json({ ok: r.ok, status: r.status, error: r.ok ? null : detail || 'Mealie odmítlo požadavek' })
  } catch (err) {
    res.status(503).json({ ok: false, error: err.message || 'Mealie není dostupné' })
  }
})

export default router
