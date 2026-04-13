import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import VotingCard from '../components/VotingCard'
import RecipeCard from '../components/RecipeCard'

const MOODS = [
  { label: 'Maso', emoji: '🥩' },
  { label: 'Lehké', emoji: '🥗' },
  { label: 'Těstoviny', emoji: '🍝' },
  { label: 'Polévka', emoji: '🍲' },
  { label: 'Veggie', emoji: '🥦' },
  { label: 'Rychlé', emoji: '⚡' },
  { label: 'Na víkend', emoji: '🎉' },
  { label: 'Dezert', emoji: '🍰' },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h >= 6 && h < 11) return { title: 'Dobré ráno! ☀️', sub: 'Co dnes uvaříme?' }
  if (h >= 11 && h < 14) return { title: 'Čas na oběd 🍽️', sub: 'Co si dáme?' }
  if (h >= 14 && h < 18) return { title: 'Dobré odpoledne 👋', sub: 'Co vaříme k večeři?' }
  if (h >= 18 && h < 23) return { title: 'Dobrý večer 🌙', sub: 'Co k večeři?' }
  return { title: 'Pozdní noc 🌙', sub: 'Ještě vaříme?' }
}

function Icon({ name }) {
  return <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>{name}</span>
}

export default function Home() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedMoods, setSelectedMoods] = useState([])
  const [proposal, setProposal] = useState(null)
  const [showVoting, setShowVoting] = useState(true)
  const [recentRecipes, setRecentRecipes] = useState([])
  const greeting = getGreeting()

  useEffect(() => {
    fetch('/api/vote/active')
      .then(r => r.json())
      .then(data => data?.id && setProposal(data))
      .catch(() => {})

    fetch('/api/mealie/history')
      .then(r => r.json())
      .then(data => setRecentRecipes((data || []).slice(0, 2)))
      .catch(() => {})
  }, [])

  const toggleMood = (mood) => {
    setSelectedMoods(prev =>
      prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
    )
  }

  const handleSearch = () => {
    if (!query && selectedMoods.length === 0) return
    navigate('/results', { state: { query, moods: selectedMoods } })
  }

  const canSearch = query.trim().length > 0 || selectedMoods.length > 0

  return (
    <Layout>
      <div className="space-y-8 mt-4">
        {/* Greeting */}
        <section>
          <h2 className="font-headline text-[28px] font-extrabold tracking-tight text-on-surface mb-1">
            {greeting.title}
          </h2>
          <p className="text-sm text-on-surface-variant font-medium">{greeting.sub}</p>
        </section>

        {/* Voting Card */}
        {proposal && showVoting && (
          <VotingCard
            proposal={proposal}
            onVote={() => {}}
            onClose={() => setShowVoting(false)}
          />
        )}

        {/* Search + Moods */}
        <div className="glass-card rounded-xl p-6 shadow-xl shadow-blue-900/5 space-y-6">
          <div>
            <label className="block font-label text-[10px] font-bold tracking-[0.15em] text-on-surface-variant uppercase mb-3">
              INGREDIENCE NEBO NÁZEV
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>search</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Kuřecí prsa, těstoviny..."
                className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest rounded-2xl border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary outline-none transition-all text-on-surface placeholder:text-outline/60 shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block font-label text-[10px] font-bold tracking-[0.15em] text-on-surface-variant uppercase mb-3">
              NEBO VYBER NÁLADU
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(({ label, emoji }) => {
                const active = selectedMoods.includes(label)
                return (
                  <button
                    key={label}
                    onClick={() => toggleMood(label)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                      active
                        ? 'brand-gradient text-white shadow-md shadow-green-500/20'
                        : 'bg-white/40 border border-white/60 hover:bg-white/60'
                    }`}
                  >
                    {label} {emoji}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={!canSearch}
            className="w-full py-4 brand-gradient text-white font-headline font-bold text-lg rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 disabled:shadow-none"
          >
            Najít recepty
          </button>
        </div>

        {/* Recently cooked */}
        {recentRecipes.length > 0 && (
          <section className="pb-4">
            <div className="flex justify-between items-end mb-4">
              <label className="font-label text-[10px] font-bold tracking-[0.15em] text-on-surface-variant uppercase">
                NEDÁVNO VAŘENO
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {recentRecipes.map((r, i) => (
                <RecipeCard key={i} recipe={r} compact />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  )
}
