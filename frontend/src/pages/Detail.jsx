import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Orbs, BottomNav } from '../components/Layout'
import TimerButton from '../components/TimerButton'

function Icon({ name, filled = false, className = '' }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
    >
      {name}
    </span>
  )
}

const SERVINGS = [2, 4, 6, 8]

export default function Detail() {
  const { id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const recipe = state?.recipe

  const [baseServings] = useState(recipe?.servings || 4)
  const [selectedServings, setSelectedServings] = useState(recipe?.servings || 4)
  const [checked, setChecked] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const scale = selectedServings / baseServings

  const scaleAmount = (amount) => {
    if (!amount) return ''
    const num = parseFloat(amount)
    if (isNaN(num)) return amount
    const scaled = num * scale
    return scaled % 1 === 0 ? String(scaled) : scaled.toFixed(1)
  }

  const toggleCheck = (i) => setChecked(prev => ({ ...prev, [i]: !prev[i] }))

  const handleSaveToMealie = async () => {
    if (!recipe?.url) return
    setSaving(true)
    try {
      await fetch('/api/mealie/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: recipe.url }),
      })
      setSaved(true)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleVotePropose = async () => {
    if (!recipe) return
    try {
      await fetch('/api/vote/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe }),
      })
    } catch {}
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">😕</p>
          <p className="font-headline font-bold">Recept nenalezen</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-primary font-bold">Zpět</button>
        </div>
      </div>
    )
  }

  return (
    <div className="font-body text-on-surface min-h-screen pb-40">
      <Orbs />

      {/* Hero */}
      <section className="relative w-full h-[450px] overflow-hidden">
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 glass-card px-4 py-2 rounded-full"
          >
            <Icon name="arrow_back" className="text-primary" />
            <span className="font-headline font-bold text-on-surface text-sm">Zpět</span>
          </button>
        </div>
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-4 right-4 z-10 glass-card p-2 rounded-full"
        >
          <Icon name="favorite" filled={isFavorite} className={isFavorite ? 'text-red-500' : 'text-outline'} />
        </button>

        {recipe.image ? (
          <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface-container to-surface-container-high flex items-center justify-center text-8xl">
            🍽️
          </div>
        )}

        {/* Title card overlay */}
        <div className="absolute bottom-0 left-0 w-full px-4 pb-4">
          <div className="glass-card p-6 rounded-lg shadow-[0_20px_40px_rgba(0,88,188,0.08)]">
            {recipe.source && (
              <p className="text-xs font-label uppercase tracking-[0.1em] text-outline mb-2">{recipe.source}</p>
            )}
            <h1 className="text-2xl font-headline font-extrabold tracking-tight text-on-surface leading-tight">
              {recipe.title}
            </h1>
          </div>
        </div>
      </section>

      <main className="px-6 mt-8 space-y-10 max-w-2xl mx-auto">
        {/* Description */}
        {recipe.description && (
          <section>
            <p className="text-on-surface-variant italic leading-relaxed text-lg font-light">
              {recipe.description}
            </p>
          </section>
        )}

        {/* Meta pills */}
        <div className="flex gap-3 flex-wrap">
          {recipe.time && (
            <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2">
              <Icon name="schedule" className="text-outline text-lg" />
              <span className="text-sm font-bold">{recipe.time} min</span>
            </div>
          )}
          {recipe.servings && (
            <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2">
              <Icon name="group" className="text-outline text-lg" />
              <span className="text-sm font-bold">{recipe.servings} porce</span>
            </div>
          )}
          {recipe.difficulty && (
            <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2">
              <Icon name="signal_cellular_alt" className="text-outline text-lg" />
              <span className="text-sm font-bold">{recipe.difficulty}</span>
            </div>
          )}
        </div>

        {/* Servings scaler */}
        <section className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Vařím pro</p>
          <div className="flex gap-2">
            {SERVINGS.map(s => (
              <button
                key={s}
                onClick={() => setSelectedServings(s)}
                className={`w-12 h-10 rounded-lg flex items-center justify-center font-bold transition-all ${
                  selectedServings === s
                    ? 'brand-gradient text-white shadow-md'
                    : 'glass-card border border-outline-variant/30 hover:bg-white/80'
                }`}
              >
                {s === 8 ? '8+' : s}
              </button>
            ))}
          </div>
        </section>

        {/* Ingredients */}
        {recipe.ingredients?.length > 0 && (
          <section className="space-y-4">
            <div className="flex justify-between items-end">
              <h2 className="text-xl font-headline font-bold text-on-surface">Ingredience</h2>
              <span className="bg-surface-container-highest px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {recipe.ingredients.length} položek
              </span>
            </div>
            <div className="space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <label
                  key={i}
                  className={`glass-card p-4 rounded-lg flex items-center gap-4 cursor-pointer active:scale-[0.99] transition-transform ${checked[i] ? 'opacity-60' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={!!checked[i]}
                    onChange={() => toggleCheck(i)}
                    className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                  <div className="flex-1 flex justify-between items-center">
                    <span className={`font-medium ${checked[i] ? 'line-through text-outline' : ''}`}>
                      {ing.name}
                    </span>
                    <span className={`font-bold ${checked[i] ? 'text-outline' : 'text-primary'}`}>
                      {scaleAmount(ing.amount)}{ing.unit ? ` ${ing.unit}` : ''}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </section>
        )}

        {/* Steps */}
        {recipe.steps?.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xl font-headline font-bold text-on-surface">Postup přípravy</h2>
            <div className="space-y-8">
              {recipe.steps.map((step, i) => (
                <div key={i} className="flex gap-6 relative">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full brand-gradient text-white flex items-center justify-center font-bold shadow-lg z-10">
                    {i + 1}
                  </div>
                  <div className="flex-1 flex justify-between items-start gap-4 pt-1">
                    <div className="space-y-2 flex-1">
                      {step.title && <h3 className="font-bold text-on-surface">{step.title}</h3>}
                      <p className="text-on-surface-variant leading-relaxed">{step.description}</p>
                    </div>
                    {step.timer && <TimerButton minutes={step.timer} />}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Fixed CTA buttons */}
      <div className="fixed bottom-[84px] left-0 w-full px-6 z-40 space-y-3">
        <button
          onClick={handleSaveToMealie}
          disabled={saving || saved}
          className="w-full h-14 brand-gradient rounded-full text-white font-headline font-extrabold tracking-tight shadow-[0_10px_30px_rgba(48,209,88,0.3)] active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Icon name={saved ? 'check_circle' : 'bookmark_add'} filled={saved} />
          {saved ? 'Uloženo v Mealie!' : saving ? 'Ukládám...' : '🥄 Přidat do Mealie'}
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleVotePropose}
            className="flex-1 h-12 glass-card rounded-full font-bold flex items-center justify-center gap-2 hover:bg-white/80 transition-colors"
          >
            <Icon name="how_to_vote" />
            Navrhnout rodině
          </button>
          {recipe.url && (
            <a
              href={recipe.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-12 glass-card rounded-full font-bold flex items-center justify-center gap-2 hover:bg-white/80 transition-colors"
            >
              <Icon name="open_in_new" />
              Originál
            </a>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
