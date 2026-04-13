import { Router } from 'express'

const router = Router()

const EMOJI_MAP = {
  'Mléčné výrobky': '🥛',
  'Nápoje': '🥤',
  'Pečivo': '🍞',
  'Maso': '🥩',
  'Ryby': '🐟',
  'Zelenina': '🥦',
  'Ovoce': '🍎',
  'Cereálie': '🌾',
  'Oleje': '🫙',
  'Cukrovinky': '🍬',
  'Mražené': '🧊',
  'default': '🛒',
}

router.get('/search', async (req, res) => {
  const { q } = req.query
  if (!q || q.length < 2) return res.json([])

  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&fields=product_name,categories_tags,image_small_url&page_size=5&lc=cs`
    const response = await fetch(url, {
      headers: { 'User-Agent': 'CoVarime/1.0 (recipe app)' },
    })
    const data = await response.json()

    const results = (data.products || [])
      .filter(p => p.product_name)
      .map(p => {
        const cats = (p.categories_tags || [])
          .map(c => c.replace(/^cs:|^en:/, '').replace(/-/g, ' '))
          .filter(c => !c.includes(':'))
        const category = cats[0] || 'Potraviny'
        const emojiKey = Object.keys(EMOJI_MAP).find(k =>
          category.toLowerCase().includes(k.toLowerCase())
        )
        return {
          name: p.product_name,
          category,
          emoji: EMOJI_MAP[emojiKey] || EMOJI_MAP.default,
          image: p.image_small_url,
        }
      })
      .slice(0, 4)

    res.json(results)
  } catch (err) {
    console.error('[Products] error:', err.message)
    res.json([])
  }
})

export default router
