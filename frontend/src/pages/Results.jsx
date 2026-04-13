import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import RecipeCard from '../components/RecipeCard'

const FILTERS = {
  time: [
    { label: 'Vše', value: null },
    { label: 'Do 30 min', value: 30 },
    { label: 'Do 60 min', value: 60 },
  ],
  servings: [
    { label: 'Vše', value: null },
    { label: 'Pro 2', value: 2 },
    { label: 'Pro 4', value: 4 },
    { label: 'Pro rodinu', value: 6 },
  ],
  type: [
    { label: 'Vše', value: null },
    { label: 'Vegetariánské', value: 'vegetarian' },
  ],
}

export default function Results() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { query = '', moods = [] } = state || {}

  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeFilter, setTimeFilter] = useState(null)
  const [servingsFilter, setServingsFilter] = useState(null)
  const [typeFilter, setTypeFilter] = useState(null)

  useEffect(() => {
    const search = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            moods,
            filters: { time: timeFilter, servings: servingsFilter, type: typeFilter },
          }),
        })
        if (!res.ok) throw new Error('Chyba při hledání')
        const data = await res.json()
        setRecipes(data)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    search()
  }, [query, moods, timeFilter, servingsFilter, typeFilter])

  const FilterChip = ({ label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold font-label transition-all ${
        active
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
          : 'glass-card text-on-surface-variant hover:bg-white/80'
      }`}
    >
      {label}
    </button>
  )

  const displayTitle = query
    ? `Výsledky: „${query}"`
    : moods.length > 0
    ? moods.join(', ')
    : 'Recepty'

  return (
    <Layout showBack backTo="/" headerTitle="">
      <div className="pt-6">
        {/* Search bar */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-surface-container-lowest h-16 px-6 rounded-lg font-medium text-lg editorial-shadow text-left text-on-surface flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>search</span>
            <span className="text-on-surface">{query || moods.join(', ') || 'Hledat...'}</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="mb-8 -mx-6 px-6 overflow-x-auto no-scrollbar flex gap-2">
          {FILTERS.time.map(f => (
            <FilterChip key={f.label} label={f.label} active={timeFilter === f.value} onClick={() => setTimeFilter(f.value)} />
          ))}
          {FILTERS.servings.slice(1).map(f => (
            <FilterChip key={f.label} label={f.label} active={servingsFilter === f.value} onClick={() => setServingsFilter(prev => prev === f.value ? null : f.value)} />
          ))}
          {FILTERS.type.slice(1).map(f => (
            <FilterChip key={f.label} label={f.label} active={typeFilter === f.value} onClick={() => setTypeFilter(prev => prev === f.value ? null : f.value)} />
          ))}
        </div>

        {/* Title */}
        <div className="mb-6 flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline font-label">VÝSLEDKY HLEDÁNÍ</p>
          <h2 className="text-3xl font-headline font-extrabold tracking-tight">{displayTitle}</h2>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card rounded-xl overflow-hidden animate-pulse">
                <div className="h-64 bg-surface-container" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-surface-container rounded w-3/4" />
                  <div className="h-4 bg-surface-container rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <p className="text-4xl mb-4">😕</p>
            <p className="font-headline font-bold text-on-surface mb-2">Něco se pokazilo</p>
            <p className="text-on-surface-variant text-sm">{error}</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-headline font-bold text-on-surface mb-2">Žádné výsledky</p>
            <p className="text-on-surface-variant text-sm">Zkus jiné ingredience nebo náladu</p>
          </div>
        ) : (
          <section className="space-y-8 pb-8">
            {recipes.map((recipe, i) => (
              <RecipeCard key={i} recipe={recipe} showRecentBadge />
            ))}
          </section>
        )}
      </div>
    </Layout>
  )
}
