import Layout from '../components/Layout'
import { useHistory } from '../hooks/useMealie'

const MEMBERS = {
  J: { color: 'bg-blue-100 text-blue-700', label: 'Já' },
  Z: { color: 'bg-purple-100 text-purple-700', label: 'Zlatěna' },
  N: { color: 'bg-orange-100 text-orange-700', label: 'Nelča' },
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'právě teď'
  if (diff < 3600) return `před ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `před ${Math.floor(diff / 3600)} hod`
  const days = Math.floor(diff / 86400)
  if (days === 1) return 'včera'
  if (days < 7) return `před ${days} dny`
  return new Date(dateStr).toLocaleDateString('cs-CZ')
}

export default function Historie() {
  const { history, loading } = useHistory()

  return (
    <Layout>
      <div className="pt-6">
        <section className="mb-8">
          <h1 className="text-[3.5rem] font-headline font-extrabold leading-[1.1] tracking-tight text-on-surface">
            Historie
          </h1>
          <p className="text-on-surface-variant opacity-70 mt-2 font-medium">Co jsme vařili</p>
        </section>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass-card p-4 rounded-lg flex items-center gap-4 animate-pulse">
                <div className="w-16 h-16 rounded-xl bg-surface-container flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-surface-container rounded w-2/3" />
                  <div className="h-4 bg-surface-container rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-6xl mb-4">🍳</p>
            <p className="font-headline font-bold text-on-surface text-xl mb-2">Zatím žádná historie</p>
            <p className="text-on-surface-variant">Uvařte svůj první recept!</p>
          </div>
        ) : (
          <div className="space-y-4 pb-8">
            {history.map((entry, i) => (
              <div key={i} className="glass-card p-4 rounded-lg flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container flex-shrink-0">
                  {entry.image ? (
                    <img src={entry.image} alt={entry.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-bold text-on-surface truncate">{entry.name || entry.title}</p>
                  <p className="text-sm text-on-surface-variant mt-0.5">{timeAgo(entry.date || entry.cookedAt)}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {(entry.cookedBy || ['J']).map(member => (
                    <div
                      key={member}
                      className={`w-7 h-7 rounded-full ${MEMBERS[member]?.color || 'bg-surface-container text-outline'} flex items-center justify-center text-xs font-bold`}
                    >
                      {member}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
