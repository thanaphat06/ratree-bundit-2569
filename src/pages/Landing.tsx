import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EVENT } from '../config/event'
import { getStats } from '../lib/api'
import Countdown from '../components/Countdown'
import SiteFooter from '../components/SiteFooter'

export default function Landing() {
  const nav = useNavigate()
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    getStats().then((r) => r.ok && setTotal(r.data.total))
  }, [])

  return (
    <div className="min-h-screen paper-grid">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-top opacity-[0.13]"
          style={{ backgroundImage: 'url(theme-poster.png)' }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[70%]"
          style={{
            background:
              'radial-gradient(60% 60% at 50% 10%, rgba(233,169,58,0.45), rgba(232,80,28,0.12) 55%, transparent 75%)',
          }}
          aria-hidden
        />

        <div className="relative mx-auto flex max-w-2xl flex-col items-center px-6 pb-14 pt-16 text-center">
          <div className="mb-6 flex items-center gap-3 rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium text-ink/70 shadow-sm">
            <span className="font-display text-lg font-bold text-orange">Bio KKU</span>
            <span className="text-stone/40">·</span>
            <span>{EVENT.dateText}</span>
          </div>

          <p className="font-display text-xl font-semibold tracking-wide text-ink/70">{EVENT.name}</p>
          <h1 className="mt-1 font-display text-6xl font-bold leading-[0.95] text-orange drop-shadow-sm sm:text-7xl">
            BACK<span className="block text-orangeDeep">TO SCHOOL</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink/75">
            ค่ำคืนแห่งความทรงจำของบัณฑิตสาขาชีววิทยา มข. ลงทะเบียนรับตั๋วเข้างานของคุณได้แล้ววันนี้
          </p>

          <button onClick={() => nav('/register')} className="btn-primary mt-7 px-8 py-4 text-lg">
            ลงทะเบียนรับตั๋ว
          </button>

          {total !== null && (
            <p className="mt-4 text-sm text-ink/60">
              ลงทะเบียนแล้ว <span className="font-bold text-orange">{total}</span> คน
            </p>
          )}

          <button onClick={() => nav('/ticket')} className="mt-3 text-sm text-ink/60 underline-offset-2 hover:underline">
            ลงทะเบียนไว้แล้ว? ดูตั๋วของฉัน
          </button>
        </div>
      </section>

      {/* การ์ดรายละเอียด */}
      <section className="mx-auto max-w-2xl px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InfoCard label="วันที่" value={EVENT.dateText} />
          <InfoCard label="เวลางาน" value={EVENT.timeText} />
          <InfoCard label="สถานที่" value={EVENT.venueShort} />
          <InfoCard label="Dress code" value={EVENT.dressCode} />
        </div>

        <div className="mt-8 rounded-2xl bg-white/70 p-6 shadow-sm">
          <p className="mb-4 text-center text-sm font-medium text-ink/70">เหลืออีก</p>
          <Countdown />
        </div>

        {/* ธีมงาน + การแต่งกาย + กำหนดการ */}
        <div className="mt-8 space-y-4">
          <DetailCard title="ธีมงาน · BACK TO SCHOOL" body={EVENT.themeDesc} />
          <DetailCard title="การแต่งกาย (Dress code)" body={EVENT.dressCodeFull} />
          <div className="rounded-2xl bg-white/70 p-6 shadow-sm">
            <p className="mb-3 font-display text-lg font-bold text-orange">กำหนดการ</p>
            <ul className="space-y-2 text-ink/80">
              <li className="flex gap-3"><span className="font-semibold text-orange">17.30</span><span>เริ่มลงทะเบียนหน้างาน (ถึง 19.00 น.)</span></li>
              <li className="flex gap-3"><span className="font-semibold text-orange">19.00</span><span>เริ่มงาน (ถึง 22.00 น.)</span></li>
            </ul>
            <p className="mt-4 rounded-xl bg-cream px-4 py-3 text-sm text-ink/70">
              📍 {EVENT.venue} — {EVENT.venueNote}
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

function DetailCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-white/70 p-6 shadow-sm">
      <p className="mb-2 font-display text-lg font-bold text-orange">{title}</p>
      <p className="leading-relaxed text-ink/80">{body}</p>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/75 p-4 text-center shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-orange">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  )
}
