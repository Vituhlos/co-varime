import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Orbs } from '../components/Layout'

const MEMBER_COLORS = {
  J: { bg: 'bg-blue-500', text: 'text-white' },
  Z: { bg: 'bg-purple-400', text: 'text-white' },
  N: { bg: 'bg-orange-400', text: 'text-white' },
}

function Icon({ name }) {
  return <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>{name}</span>
}

function SectionLabel({ children }) {
  return <h2 className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-4 px-2">{children}</h2>
}

export default function Nastaveni() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)
  const [testStatus, setTestStatus] = useState(null)

  const [mealieUrl, setMealieUrl] = useState('')
  const [mealieApiKey, setMealieApiKey] = useState('')
  const [mealieApiKeySet, setMealieApiKeySet] = useState(false)
  const [anthropicApiKey, setAnthropicApiKey] = useState('')
  const [anthropicApiKeySet, setAnthropicApiKeySet] = useState(false)
  const [defaultServings, setDefaultServings] = useState(4)
  const [members, setMembers] = useState([])
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(cfg => {
        setMealieUrl(cfg.mealieUrl || '')
        setMealieApiKey(cfg.mealieApiKey || '')
        setMealieApiKeySet(cfg.mealieApiKeySet)
        setAnthropicApiKey(cfg.anthropicApiKey || '')
        setAnthropicApiKeySet(cfg.anthropicApiKeySet)
        setDefaultServings(cfg.defaultServings || 4)
        setMembers(cfg.members || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaveStatus(null)
    try {
      const body = { mealieUrl, defaultServings, members }
      if (mealieApiKey && mealieApiKey !== '••••••••') body.mealieApiKey = mealieApiKey
      if (anthropicApiKey && anthropicApiKey !== '••••••••') body.anthropicApiKey = anthropicApiKey

      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      setSaveStatus(res.ok ? 'ok' : 'error')
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  const testConnection = async () => {
    setTestStatus('testing')
    const keyToTest = (mealieApiKey && mealieApiKey !== '••••••••') ? mealieApiKey : undefined
    try {
      const res = await fetch('/api/mealie/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: mealieUrl, apiKey: keyToTest }),
      })
      setTestStatus(res.ok ? 'ok' : 'error')
    } catch {
      setTestStatus('error')
    }
    setTimeout(() => setTestStatus(null), 5000)
  }

  const toggleDark = () => {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle('dark', next)
  }

  const addMember = () => {
    const key = prompt('Iniciála (jedno písmeno):')?.trim().toUpperCase().charAt(0)
    const name = key ? prompt('Jméno:')?.trim() : null
    if (key && name) setMembers(prev => [...prev, { key, name, role: '' }])
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-on-surface-variant animate-pulse">Načítám nastavení...</div>
    </div>
  )

  return (
    <div className="font-body text-on-surface min-h-screen relative overflow-x-hidden">
      <Orbs />
      <header className="bg-white/55 backdrop-blur-2xl sticky top-0 z-50 shadow-xl shadow-blue-900/5">
        <div className="flex items-center justify-between px-6 h-16 w-full max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="text-blue-600 hover:bg-white/20 p-2 rounded-full active:scale-95 transition-transform">
              <Icon name="arrow_back" />
            </button>
            <h1 className="font-headline font-bold tracking-tight text-xl">Nastavení</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
              saveStatus === 'ok' ? 'bg-green-500 text-white' :
              saveStatus === 'error' ? 'bg-red-500 text-white' :
              'brand-gradient text-white'
            } disabled:opacity-50`}
          >
            {saving ? 'Ukládám...' : saveStatus === 'ok' ? '✓ Uloženo' : saveStatus === 'error' ? 'Chyba' : 'Uložit'}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-10 pb-20">

        {/* Domácnost */}
        <section>
          <SectionLabel>Domácnost</SectionLabel>
          <div className="space-y-3">
            {members.map((m, i) => {
              const colors = MEMBER_COLORS[m.key] || { bg: 'bg-surface-container', text: 'text-on-surface' }
              return (
                <div key={m.key} className="glass-card p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center font-bold text-lg shadow-lg`}>
                      {m.key}
                    </div>
                    <div>
                      <p className="font-semibold">{m.name}</p>
                      {m.role && <p className="text-xs text-outline uppercase tracking-wider">{m.role}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {i > 0 && (
                      <button
                        onClick={() => setMembers(prev => prev.filter((_, j) => j !== i))}
                        className="p-2 text-outline hover:text-error transition-colors"
                      >
                        <Icon name="delete" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            <button
              onClick={addMember}
              className="w-full glass-card border-dashed border-2 border-outline-variant/30 p-4 rounded-lg flex items-center justify-center gap-2 font-semibold text-primary hover:bg-white/80 transition-all active:scale-[0.98]"
            >
              <Icon name="add" /> Přidat člena
            </button>
          </div>
        </section>

        {/* Mealie připojení */}
        <section>
          <SectionLabel>Připojení k Mealie</SectionLabel>
          <div className="glass-card p-6 rounded-lg space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface-variant">Mealie URL</label>
              <input
                value={mealieUrl}
                onChange={e => setMealieUrl(e.target.value)}
                className="w-full bg-surface-container-lowest rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                placeholder="http://192.168.1.114:9000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface-variant">
                API Klíč {mealieApiKeySet && <span className="text-green-600 text-xs ml-1">✓ nastaven</span>}
              </label>
              <input
                value={mealieApiKey}
                onChange={e => setMealieApiKey(e.target.value)}
                onFocus={e => { if (e.target.value === '••••••••') setMealieApiKey('') }}
                type="password"
                className="w-full bg-surface-container-lowest rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                placeholder="Mealie API klíč..."
              />
            </div>
            <button
              onClick={testConnection}
              className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 border transition-colors ${
                testStatus === 'ok' ? 'bg-green-500/10 text-green-700 border-green-500/20' :
                testStatus === 'error' ? 'bg-red-500/10 text-red-700 border-red-500/20' :
                'bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20'
              }`}
            >
              <Icon name={testStatus === 'ok' ? 'check_circle' : testStatus === 'error' ? 'error' : 'sync'} />
              {testStatus === 'testing' ? 'Testuji...' :
               testStatus === 'ok' ? 'Připojení funguje!' :
               testStatus === 'error' ? 'Nelze se připojit' :
               'Otestovat připojení'}
            </button>
          </div>
        </section>

        {/* Claude API */}
        <section>
          <SectionLabel>Claude API (hledání receptů)</SectionLabel>
          <div className="glass-card p-6 rounded-lg space-y-3">
            <label className="text-sm font-semibold text-on-surface-variant">
              Anthropic API Klíč {anthropicApiKeySet && <span className="text-green-600 text-xs ml-1">✓ nastaven</span>}
            </label>
            <input
              value={anthropicApiKey}
              onChange={e => setAnthropicApiKey(e.target.value)}
              onFocus={e => { if (e.target.value === '••••••••') setAnthropicApiKey('') }}
              type="password"
              className="w-full bg-surface-container-lowest rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
              placeholder="sk-ant-..."
            />
            <p className="text-xs text-on-surface-variant">Klíč se ukládá na server, nikdy není viditelný v prohlížeči.</p>
          </div>
        </section>

        {/* Výchozí nastavení */}
        <section>
          <SectionLabel>Výchozí nastavení</SectionLabel>
          <div className="glass-card p-6 rounded-lg space-y-3">
            <label className="text-sm font-semibold text-on-surface-variant">Výchozí porce</label>
            <div className="flex gap-2">
              {[2, 4, 6, 8].map(s => (
                <button
                  key={s}
                  onClick={() => setDefaultServings(s)}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                    defaultServings === s ? 'brand-gradient text-white shadow-md' : 'bg-surface-container-highest/50 hover:bg-surface-container-highest'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Vzhled */}
        <section>
          <SectionLabel>Vzhled</SectionLabel>
          <div className="glass-card p-6 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-bold">Režim</p>
              <p className="text-sm text-outline">{darkMode ? 'Tmavý' : 'Světlý'}</p>
            </div>
            <div className="flex bg-surface-container p-1 rounded-full w-44 relative">
              <button onClick={() => darkMode && toggleDark()} className={`z-10 flex-1 py-2 text-xs font-bold uppercase tracking-widest ${!darkMode ? 'text-on-surface' : 'text-outline'}`}>Světlý</button>
              <button onClick={() => !darkMode && toggleDark()} className={`z-10 flex-1 py-2 text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-on-surface' : 'text-outline'}`}>Tmavý</button>
              <div className="absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-all duration-300" style={{ left: darkMode ? 'calc(50% + 4px)' : '4px' }} />
            </div>
          </div>
        </section>

        {/* O aplikaci */}
        <section>
          <SectionLabel>O aplikaci</SectionLabel>
          <div className="glass-card p-6 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant font-medium">Verze</span>
              <span className="font-bold text-primary">1.0.0</span>
            </div>
          </div>
        </section>

        <div className="pt-4 text-center">
          <p className="text-xs text-outline font-bold uppercase tracking-[0.2em]">S láskou uvařeno v 2026 😄</p>
        </div>
      </main>
    </div>
  )
}
