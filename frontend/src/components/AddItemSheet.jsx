import { useState, useEffect, useRef } from 'react'

const UNITS = ['ks', 'g', 'kg', 'ml', 'l', 'balení']

function Icon({ name }) {
  return (
    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
      {name}
    </span>
  )
}

export default function AddItemSheet({ onClose, onAdd }) {
  const [step, setStep] = useState(1)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selected, setSelected] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('ks')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!query || query.length < 2) { setSuggestions([]); return }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setSuggestions(data.slice(0, 4))
      } catch {
        setSuggestions([])
      }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const handleSelect = (item) => {
    setSelected(item)
    setStep(2)
  }

  const handleAdd = async () => {
    setLoading(true)
    try {
      const item = {
        name: selected?.name || query,
        quantity,
        unit,
        note,
        group: 'Ostatní',
      }
      await onAdd(item)
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end">
      <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-2xl rounded-t-[32px] shadow-[0_-8px_40px_rgba(0,0,0,0.1)] p-6 pb-8 slide-up max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-outline-variant/50" />

        <div className="mt-4">
          <h2 className="text-xl font-headline font-bold text-on-surface mb-6">
            {step === 1 ? 'Přidat položku' : 'Nastavit množství'}
          </h2>

          {step === 1 ? (
            <>
              <div className="relative group mb-6">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 group-focus-within:text-primary transition-colors" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                  search
                </span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && query && handleSelect({ name: query })}
                  className="w-full h-14 pl-12 pr-4 bg-white/50 border border-white/40 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none font-medium placeholder:text-on-surface-variant/40 transition-all shadow-inner"
                  placeholder="Název položky..."
                />
              </div>

              {suggestions.length > 0 && (
                <div className="space-y-1 mb-6">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelect(s)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 transition-colors group text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl flex-shrink-0">
                        {s.emoji || '🛒'}
                      </div>
                      <div className="flex-1">
                        <span className="block font-semibold text-on-surface">{s.name}</span>
                        <span className="text-xs text-on-surface-variant font-medium">{s.category}</span>
                      </div>
                      <Icon name="add_circle" />
                    </button>
                  ))}
                </div>
              )}

              {query.length >= 2 && suggestions.length === 0 && (
                <button
                  onClick={() => handleSelect({ name: query })}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 transition-colors text-left mb-6"
                >
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-xl">
                    ➕
                  </div>
                  <div>
                    <span className="block font-semibold text-on-surface">Přidat „{query}"</span>
                    <span className="text-xs text-on-surface-variant">Vlastní položka</span>
                  </div>
                </button>
              )}
            </>
          ) : (
            <>
              <div className="glass-card p-4 rounded-2xl flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
                  {selected?.emoji || '🛒'}
                </div>
                <div className="flex-1">
                  <span className="font-bold text-on-surface">{selected?.name}</span>
                  {selected?.category && <span className="block text-xs text-outline">{selected.category}</span>}
                </div>
                <button onClick={() => setStep(1)} className="text-outline hover:text-primary">
                  <Icon name="edit" />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-[10px] font-bold text-outline uppercase tracking-wider mb-3">Množství</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(q => Math.max(0.5, q - (q > 1 ? 1 : 0.5)))}
                    className="w-12 h-12 rounded-full glass-card flex items-center justify-center font-bold text-xl hover:bg-white/80 transition-colors active:scale-95"
                  >
                    −
                  </button>
                  <span className="text-2xl font-headline font-bold w-16 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + (q >= 1 ? 1 : 0.5))}
                    className="w-12 h-12 rounded-full brand-gradient text-white flex items-center justify-center font-bold text-xl hover:opacity-90 transition-opacity active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-[10px] font-bold text-outline uppercase tracking-wider mb-3">Jednotka</h3>
                <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-2 px-2">
                  {UNITS.map(u => (
                    <button
                      key={u}
                      onClick={() => setUnit(u)}
                      className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                        unit === u
                          ? 'brand-gradient text-white shadow-sm'
                          : 'bg-white/50 border border-white/40 text-on-surface-variant hover:bg-white'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-[10px] font-bold text-outline uppercase tracking-wider mb-3">Poznámka (volitelné)</h3>
                <input
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Např. bio, bez laktózy..."
                  className="w-full h-12 px-4 bg-white/50 border border-white/40 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-medium placeholder:text-on-surface-variant/40"
                />
              </div>

              <button
                onClick={handleAdd}
                disabled={loading}
                className="w-full py-4 brand-gradient text-white font-headline font-bold text-lg rounded-full shadow-lg shadow-blue-500/30 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Přidávám...' : 'Přidat do seznamu'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
