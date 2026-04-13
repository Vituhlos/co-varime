import { useState, useEffect } from 'react'

export function useRecipes() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/mealie/recipes')
      .then(r => r.json())
      .then(data => setRecipes(data.items || data || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { recipes, loading, error }
}

export function useHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/mealie/history')
      .then(r => r.json())
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [])

  return { history, loading }
}

export function useShoppingList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = () => {
    fetch('/api/mealie/shopping')
      .then(r => r.json())
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { refresh() }, [])

  return { items, setItems, loading, refresh }
}
