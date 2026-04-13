import { useNavigate } from 'react-router-dom'

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

export default function RecipeCard({ recipe, showRecentBadge = false, compact = false }) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/recipe/${encodeURIComponent(recipe.url || recipe.id || recipe.title)}`, {
      state: { recipe }
    })
  }

  const wasRecentlyCooked = showRecentBadge && recipe.lastCooked &&
    (Date.now() - new Date(recipe.lastCooked).getTime()) < 7 * 24 * 60 * 60 * 1000

  if (compact) {
    return (
      <div
        className="glass-card p-4 rounded-xl group cursor-pointer hover:shadow-lg transition-shadow active:scale-[0.98]"
        onClick={handleClick}
      >
        <div className="w-full aspect-square rounded-lg mb-3 overflow-hidden bg-surface-container">
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
          )}
        </div>
        <h3 className="font-headline font-bold text-on-surface text-sm truncate">{recipe.title}</h3>
        {recipe.lastCooked && (
          <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">
            před {Math.floor((Date.now() - new Date(recipe.lastCooked).getTime()) / (1000 * 60 * 60 * 24))} dny
          </p>
        )}
      </div>
    )
  }

  return (
    <article
      className="glass-card rounded-xl overflow-hidden editorial-shadow group active:scale-[0.98] transition-all duration-300 cursor-pointer"
      onClick={handleClick}
    >
      <div className="h-64 overflow-hidden relative bg-surface-container">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-surface-container-low to-surface-container">
            🍽️
          </div>
        )}
      </div>
      <div className="p-6">
        {recipe.source && (
          <p className="text-[10px] text-outline uppercase tracking-widest font-label mb-1">{recipe.source}</p>
        )}
        <h3 className="text-xl font-headline font-bold mb-3 tracking-tight">{recipe.title}</h3>
        <div className="flex gap-4 flex-wrap">
          {recipe.time && (
            <div className="flex items-center gap-1.5">
              <Icon name="schedule" className="text-outline-variant text-lg" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label">
                {recipe.time} MIN
              </span>
            </div>
          )}
          {recipe.difficulty && (
            <div className="flex items-center gap-1.5">
              <Icon name="signal_cellular_alt" className="text-outline-variant text-lg" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label">
                {recipe.difficulty.toUpperCase()}
              </span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-1.5">
              <Icon name="group" className="text-outline-variant text-lg" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label">
                {recipe.servings} PORCE
              </span>
            </div>
          )}
        </div>
        {wasRecentlyCooked && (
          <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container-low border border-outline-variant/30">
            <span className="text-[10px] font-medium text-on-surface-variant flex items-center gap-1">
              🔄 Nedávno vařeno
            </span>
          </div>
        )}
      </div>
    </article>
  )
}
