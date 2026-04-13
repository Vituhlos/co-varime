import { useState } from 'react'

const MEMBERS = [
  { key: 'J', label: 'Já', color: 'bg-blue-100 text-blue-700' },
  { key: 'Z', label: 'Zlatěna', color: 'bg-purple-100 text-purple-700' },
  { key: 'N', label: 'Nelča', color: 'bg-orange-100 text-orange-700' },
]

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

export default function VotingCard({ proposal, onVote, onClose }) {
  const [voting, setVoting] = useState(false)

  const handleVote = async (vote) => {
    setVoting(true)
    try {
      await fetch(`/api/vote/${proposal.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote, member: 'J' }),
      })
      onVote?.()
    } catch (e) {
      console.error(e)
    } finally {
      setVoting(false)
    }
  }

  return (
    <div className="glass-card rounded-[24px] p-5 shadow-xl shadow-blue-900/5 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-outline hover:text-on-surface transition-colors"
      >
        <Icon name="close" />
      </button>

      <label className="block font-headline text-[10px] font-bold tracking-[0.15em] text-on-surface-variant uppercase mb-4">
        ČEKÁ NA HLASOVÁNÍ
      </label>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm bg-surface-container flex-shrink-0">
          {proposal.image ? (
            <img src={proposal.image} alt={proposal.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-headline font-bold text-on-surface text-base truncate">{proposal.title}</h3>
          <p className="text-xs text-on-surface-variant font-medium">Navrhl: {proposal.proposedBy || 'Já'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => handleVote('yes')}
          disabled={voting}
          className="flex items-center justify-center gap-2 py-3 rounded-[18px] bg-green-500/10 border border-green-500/20 text-green-700 font-bold text-sm hover:bg-green-500/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <span>👍</span> Chci to
        </button>
        <button
          onClick={() => handleVote('no')}
          disabled={voting}
          className="flex items-center justify-center gap-2 py-3 rounded-[18px] bg-red-500/10 border border-red-500/20 text-red-700 font-bold text-sm hover:bg-red-500/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <span>👎</span> Nechci
        </button>
      </div>

      <div className="flex gap-2">
        {MEMBERS.map(({ key, label, color }) => {
          const vote = proposal.votes?.[key]
          return (
            <div key={key} className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-full border border-white/40">
              <div className={`w-5 h-5 rounded-full ${color} flex items-center justify-center text-[10px] font-bold`}>
                {key}
              </div>
              {vote === 'yes' ? (
                <Icon name="check_circle" className="text-[14px] text-green-500" filled />
              ) : vote === 'no' ? (
                <Icon name="cancel" className="text-[14px] text-red-400" filled />
              ) : (
                <Icon name="help" className="text-[14px] text-outline/50" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
