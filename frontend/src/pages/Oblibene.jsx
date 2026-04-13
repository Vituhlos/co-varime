import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import RecipeCard from '../components/RecipeCard'
import { useRecipes } from '../hooks/useMealie'

function Icon({ name }) {
  return <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>{name}</span>
}

export default function Oblibene() {
  const { recipes, loading } = useRecipes()
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const filtered = recipes.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.title?.toLowerCase().includes(search.toLowerCase())
  )

  const handleRandom = () => {
    if (filtered.length === 0) return
    const r = filtered[Math.floor(Math.random() * filtered.length)]
    navigate(`/recipe/${encodeURIComponent(r.slug || r.id || r.name)}`, { state: { recipe: normalizeRecipe(r) } })
  }

  const normalizeRecipe = (r) => ({
    title: r.name || r.title,
    image: r.image || r.imageUrl,
    time: r.totalTime || r.prepTime,
    difficulty: r.difficulty,
    servings: r.recipeYield || r.servings,
    source: r.orgURL ? new URL(r.orgURL).hostname : undefined,
    url: r.orgURL,
    ingredients: r.recipeIngredient?.map(i => typeof i === 'string' ? { name: i } : i) || [],
    steps: r.recipeInstructions?.map(s => ({ description: typeof s === 'string' ? s : s.text })) || [],
  })

  return (
    <Layout>
      <div className="pt-6">
        <section className="mb-8">
          <h1 className="text-[3.5rem] font-headline font-extrabold leading-[1.1] tracking-tight text-on-surface">
            Moje recepty
          </h1>
          <p className="text-on-surface-variant opacity-70 mt-2 font-medium">Uloženo v Mealie</p>
        </section>

        {/* Search */}
        <div className="mb-6">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface-container-lowest h-14 pl-12 pr-4 rounded-lg outline-none focus:ring-4 focus:ring-primary/10 text-on-surface"
              placeholder="Hledej v uložených..."
            />
          </div>
        </div>

        {/* Random */}
        <button
          onClick={handleRandom}
          className="glass-card w-full p-5 mb-8 rounded-[24px] flex flex-col items-center justify-center text-center transition-transform active:scale-[0.98] cursor-pointer hover:bg-white/80"
        >
          <span className="text-[18px] font-headline font-medium text-on-surface flex items-center gap-2">
            <Icon name="shuffle" /> Překvap mě — náhodný recept
          </span>
          <span className="text-sm text-on-surface-variant opacity-70 mt-1 font-medium">
            Vylosuje recept z tvé sbírky
          </span>
        </button>

        {/* Recipe list */}
        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-surface-container" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-surface-container rounded w-3/4" />
                  <div className="h-4 bg-surface-container rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <p className="text-4xl mb-4">{recipes.length === 0 ? '📚' : '🔍'}</p>
            <p className="font-headline font-bold text-on-surface mb-2">
              {recipes.length === 0 ? 'Zatím žádné uložené recepty' : 'Žádné výsledky'}
            </p>
            <p className="text-on-surface-variant text-sm">
              {recipes.length === 0
                ? 'Přidej recepty z Mealie nebo z hledání'
                : 'Zkus jiný dotaz'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 pb-8">
            {filtered.map((r, i) => (
              <RecipeCard key={i} recipe={normalizeRecipe(r)} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
