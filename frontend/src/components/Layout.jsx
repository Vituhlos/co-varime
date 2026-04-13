import { Link, useLocation } from 'react-router-dom'

function Icon({ name, filled = false }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
    >
      {name}
    </span>
  )
}

export function Orbs() {
  return (
    <>
      <div style={{ position: 'fixed', top: '-100px', left: '-100px', width: '400px', height: '400px', background: '#7dd3fc', filter: 'blur(80px)', opacity: 0.3, borderRadius: '50%', zIndex: -1, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-150px', right: '-100px', width: '500px', height: '500px', background: '#d8b4fe', filter: 'blur(80px)', opacity: 0.3, borderRadius: '50%', zIndex: -1, pointerEvents: 'none' }} />
    </>
  )
}

export function AppHeader({ showBack = false, backTo = '/', title, showSettings = true }) {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/55 backdrop-blur-xl shadow-sm">
      <div className="flex items-center justify-between px-6 h-16 w-full max-w-2xl mx-auto">
        {showBack ? (
          <Link to={backTo} className="flex items-center gap-2 text-primary font-bold">
            <Icon name="arrow_back" />
            {title && <span className="font-headline font-bold text-on-surface">{title}</span>}
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Icon name="restaurant_menu" />
            <span
              className="text-xl font-black font-headline tracking-tight"
              style={{ background: 'linear-gradient(135deg, #32ADE6, #30D158)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Co vaříme?
            </span>
          </div>
        )}
        {showSettings && !showBack && (
          <Link to="/nastaveni" className="p-2 text-outline hover:text-primary transition-colors rounded-full hover:bg-white/40">
            <Icon name="settings" />
          </Link>
        )}
      </div>
    </header>
  )
}

const navItems = [
  { to: '/', icon: 'search', label: 'Hledej' },
  { to: '/oblibene', icon: 'favorite', label: 'Oblíbené' },
  { to: '/nakupni-seznam', icon: 'shopping_cart', label: 'Nákupní seznam' },
  { to: '/historie', icon: 'history', label: 'Historie' },
]

export function BottomNav() {
  const { pathname } = useLocation()

  const isActive = (to) => {
    if (to === '/') return pathname === '/' || pathname === '/results' || pathname.startsWith('/recipe')
    return pathname === to
  }

  return (
    <nav className="fixed bottom-0 w-full z-50 rounded-t-[24px] bg-white/55 backdrop-blur-3xl border-t border-white/45 shadow-[0_-10px_40px_rgba(0,88,188,0.08)] flex justify-around items-center h-20 px-4">
      {navItems.map(({ to, icon, label }) => {
        const active = isActive(to)
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${active ? 'text-blue-600 font-bold' : 'text-slate-500'}`}
          >
            <Icon name={icon} filled={active} />
            <span className="text-[10px] font-medium tracking-wide uppercase">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export default function Layout({ children, showBack = false, backTo = '/', headerTitle, showSettings = true, noPadding = false }) {
  return (
    <div className="font-body text-on-surface min-h-screen pb-24">
      <Orbs />
      <AppHeader showBack={showBack} backTo={backTo} title={headerTitle} showSettings={showSettings} />
      <main className={noPadding ? 'pt-16' : 'pt-16 px-6 pb-8 max-w-2xl mx-auto'}>
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
