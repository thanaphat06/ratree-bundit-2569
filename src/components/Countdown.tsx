import { useEffect, useState } from 'react'
import { EVENT } from '../config/event'

function diff() {
  const ms = new Date(EVENT.startISO).getTime() - Date.now()
  const clamp = Math.max(0, ms)
  return {
    d: Math.floor(clamp / 86400000),
    h: Math.floor((clamp % 86400000) / 3600000),
    m: Math.floor((clamp % 3600000) / 60000),
    s: Math.floor((clamp % 60000) / 1000),
    done: ms <= 0,
  }
}

export default function Countdown() {
  const [t, setT] = useState(diff())
  useEffect(() => {
    const id = setInterval(() => setT(diff()), 1000)
    return () => clearInterval(id)
  }, [])

  if (t.done) {
    return <p className="text-center text-lg font-semibold text-orange">วันนี้คือวันงานแล้ว 🎓</p>
  }

  const cell = (n: number, label: string) => (
    <div className="flex min-w-[70px] flex-col items-center rounded-2xl bg-white/80 px-3 py-2 shadow-warm">
      <span className="font-display text-3xl font-bold text-orange tabular-nums">
        {String(n).padStart(2, '0')}
      </span>
      <span className="text-xs text-ink/60">{label}</span>
    </div>
  )

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {cell(t.d, 'วัน')}
      {cell(t.h, 'ชม.')}
      {cell(t.m, 'นาที')}
      {cell(t.s, 'วินาที')}
    </div>
  )
}
