import { useState, useEffect, useRef } from 'react'

function Icon({ name, filled = false }) {
  return (
    <span
      className="material-symbols-outlined text-sm"
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
    >
      {name}
    </span>
  )
}

export default function TimerButton({ minutes }) {
  const [state, setState] = useState('idle') // idle | running | done
  const [remaining, setRemaining] = useState(minutes * 60)
  const intervalRef = useRef(null)

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  const start = () => {
    setState('running')
    setRemaining(minutes * 60)
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setState('done')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stop = () => {
    clearInterval(intervalRef.current)
    setState('idle')
    setRemaining(minutes * 60)
  }

  const fmt = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  if (state === 'done') {
    return (
      <button
        onClick={stop}
        className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm whitespace-nowrap bg-green-500 text-white"
      >
        <Icon name="check_circle" filled />
        Hotovo!
      </button>
    )
  }

  if (state === 'running') {
    return (
      <button
        onClick={stop}
        className="flex-shrink-0 brand-gradient text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm whitespace-nowrap"
      >
        <Icon name="timer" filled />
        {fmt(remaining)}
      </button>
    )
  }

  return (
    <button
      onClick={start}
      className="flex-shrink-0 glass-card px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm whitespace-nowrap hover:bg-white/80 transition-colors"
    >
      <span>⏱</span> {minutes} min
    </button>
  )
}
