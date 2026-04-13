import { useState } from 'react'
import Layout from '../components/Layout'
import AddItemSheet from '../components/AddItemSheet'
import useWebSocket from '../hooks/useWebSocket'
import { useShoppingList } from '../hooks/useMealie'

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

export default function NakupniSeznam() {
  const { items, setItems, refresh } = useShoppingList()
  const [showSheet, setShowSheet] = useState(false)

  useWebSocket((event) => {
    if (['item_added', 'item_checked', 'item_deleted', 'list_cleared'].includes(event.type)) {
      refresh()
    }
  })

  const toggleItem = async (id, checked) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, checked } : item))
    try {
      await fetch(`/api/mealie/shopping/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked }),
      })
    } catch {}
  }

  const deleteItem = async (id) => {
    setItems(prev => prev.filter(item => item.id !== id))
    try {
      await fetch(`/api/mealie/shopping/${id}`, { method: 'DELETE' })
    } catch {}
  }

  const clearChecked = async () => {
    const checkedIds = items.filter(i => i.checked).map(i => i.id)
    setItems(prev => prev.filter(i => !i.checked))
    try {
      await Promise.all(checkedIds.map(id =>
        fetch(`/api/mealie/shopping/${id}`, { method: 'DELETE' })
      ))
    } catch {}
  }

  const addItem = async (item) => {
    const res = await fetch('/api/mealie/shopping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    })
    const newItem = await res.json()
    setItems(prev => [...prev, newItem])
  }

  // Group items by recipe/group
  const groups = items.reduce((acc, item) => {
    const key = item.group || item.recipeReference || 'Ostatní'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const hasChecked = items.some(i => i.checked)

  return (
    <>
      <Layout>
        <div className="pt-6">
          <section className="mb-8">
            <h1 className="text-[3.5rem] font-headline font-extrabold leading-[1.1] tracking-tight text-on-surface">
              Nákupní seznam
            </h1>
            <p className="text-on-surface-variant opacity-70 mt-2 font-medium">
              {items.length} {items.length === 1 ? 'položka' : items.length < 5 ? 'položky' : 'položek'}
            </p>
          </section>

          {items.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <p className="text-6xl mb-4">🛒</p>
              <p className="font-headline font-bold text-on-surface text-xl mb-2">Prázdný seznam</p>
              <p className="text-on-surface-variant">Přidej položky přes tlačítko + níže</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groups).map(([group, groupItems]) => (
                <section key={group} className="glass-card rounded-lg p-6 shadow-sm">
                  <h3 className="font-headline text-sm font-bold text-on-surface-variant tracking-[0.2em] uppercase mb-6">
                    {group}
                  </h3>
                  <div className="space-y-4">
                    {groupItems.map((item) => (
                      <div key={item.id} className="flex items-center group">
                        <label className="flex items-center flex-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!item.checked}
                            onChange={e => toggleItem(item.id, e.target.checked)}
                            className="w-6 h-6 rounded-lg border-outline-variant text-primary focus:ring-primary-container transition-all"
                          />
                          <div className="ml-4 flex-1">
                            <span className={`block font-semibold transition-all ${item.checked ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                              {item.name || item.note}
                            </span>
                            {(item.quantity || item.unit) && (
                              <span className={`text-sm ${item.checked ? 'text-outline' : 'text-on-surface-variant'}`}>
                                {item.quantity}{item.unit ? ` ${item.unit}` : ''}
                              </span>
                            )}
                          </div>
                        </label>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-2 text-outline opacity-40 hover:opacity-100 hover:text-error transition-all"
                        >
                          <Icon name="delete" className="text-[20px]" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {hasChecked && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={clearChecked}
                className="glass-card flex items-center gap-2 px-8 py-4 rounded-full text-error font-bold hover:bg-white/40 transition-all active:scale-95 shadow-lg"
              >
                <Icon name="delete_sweep" />
                Vymazat nakoupené
              </button>
            </div>
          )}
        </div>
      </Layout>

      {/* FAB */}
      <button
        onClick={() => setShowSheet(true)}
        className="fixed bottom-[100px] right-6 w-14 h-14 rounded-full brand-gradient flex items-center justify-center text-white shadow-[0_8px_24px_rgba(48,209,88,0.3)] z-[60] active:scale-90 transition-transform"
      >
        <Icon name="add" className="text-3xl font-bold" />
      </button>

      {/* Add Item Sheet */}
      {showSheet && (
        <AddItemSheet
          onClose={() => setShowSheet(false)}
          onAdd={addItem}
        />
      )}
    </>
  )
}
