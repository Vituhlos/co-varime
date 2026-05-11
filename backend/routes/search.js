import { Router } from 'express'
import { getConfig } from '../config.js'

const router = Router()

router.post('/', async (req, res) => {
  const { query, moods = [], filters = {} } = req.body
  const { anthropicApiKey } = getConfig()

  if (!anthropicApiKey) {
    return res.status(503).json({ error: 'Anthropic API klíč není nastaven. Nastav ho v Nastavení.' })
  }

  const searchQuery = [query, ...moods].filter(Boolean).join(', ')
  if (!searchQuery) return res.json([])

  const filterText = [
    filters.time && `do ${filters.time} minut`,
    filters.servings && `pro ${filters.servings} osoby`,
    filters.type === 'vegetarian' && 'vegetariánské',
  ].filter(Boolean).join(', ')

  const userMessage = filterText
    ? `Najdi recepty na: ${searchQuery}. Požadavky: ${filterText}.`
    : `Najdi recepty na: ${searchQuery}.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: `Jsi asistent pro hledání receptů. Hledáš české recepty na internetu.
Vždy vrať POUZE validní JSON pole receptů bez jakéhokoliv dalšího textu:
[{ "title": "", "url": "", "time": 30, "difficulty": "Lehké|Střední|Těžké",
   "servings": 4, "source": "toprecepty.cz", "image": "",
   "description": "",
   "ingredients": [{"name":"","amount":"","unit":""}],
   "steps": [{"title":"","description":"","timer":null}] }]
Hledej výhradně na českých receptových webech (toprecepty.cz, vareni.cz, recepty.cz, apetit.cz, kuchyne.cz).
Vrať 3-5 receptů. Vrať pouze validní JSON, žádný jiný text.`,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }

    const data = await response.json()

    // Extract text from response
    let text = ''
    for (const block of data.content || []) {
      if (block.type === 'text') text += block.text
    }

    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return res.json([])

    const recipes = JSON.parse(jsonMatch[0])
    res.json(Array.isArray(recipes) ? recipes : [])
  } catch (err) {
    console.error('[Search] Error:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
