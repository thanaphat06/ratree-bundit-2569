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
      <section className="relative">
        {/* รูปจริงเป็นพื้นหลัง hero */}
        <div className="relative">
          <img
            src="hero.png"
            alt="ราตรีบัณฑิต 2569 BACK TO SCHOOL"
            className="mx-auto block h-auto w-full max-w-lg"
          />
          {/* หัวเรื่องทับบนช่วงซุ้มสว่าง */}
          <div className="absolute inset-x-0 top-0 flex flex-col items-center px-6 pt-[16%] text-center">
            <p className="font-display text-lg font-semibold tracking-wide text-ink/80 drop-shadow-[0_1px_6px_rgba(255,255,255,0.8)]">
              {EVENT.name}
            </p>
            <h1 className="mt-1 font-display text-6xl font-bold leading-[0.92] text-orange drop-shadow-[0_2px_10px_rgba(255,255,255,0.75)] sm:text-7xl">
              BACK<span className="block text-orangeDeep">TO SCHOOL</span>
            </h1>
          </div>
          {/* เฟดเข้าสู่พื้นครีมด้านล่าง */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-cream" />
        </div>

        {/* CTA ใต้รูป */}
        <div className="relative -mt-4 flex flex-col items-center px-6 pb-12 text-center">
          <p className="max-w-lg text-lg text-ink/75">
            ร่วมสร้างค่ำคืนแห่งความทรงจำ แสดงความยินดีกับบัณฑิตใหม่ป้ายแดง แห่งสาขาวิชาชีววิทยา คณะวิทยาศาสตร์ มหาวิทยาลัยขอนแก่น
          </p>
          <button onClick={() => nav('/register')} className="btn-primary mt-6 px-8 py-4 text-lg">
            ลงทะเบียนรับตั๋ว
          </button>
          <p className="mt-3 max-w-md text-sm text-ink/60">
            ลงทะเบียนรับตั๋วเพื่อเข้างานของคุณได้แล้ว ตั้งแต่วันนี้ ถึง {EVENT.deadlineText}
          </p>
          {total !== null && (
            <p className="mt-3 text-sm text-ink/60">
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <InfoCard label="วันที่" value={EVENT.dateText} />
          <InfoCard label="เวลาลงทะเบียน" value="17.30 - 19.00 น." />
          <InfoCard label="เวลาเริ่มงาน" value={EVENT.timeText} />
          <InfoCard label="สถานที่" value={EVENT.venue} />
          <InfoCard label="Dress code" value={EVENT.dressCode} />
        </div>

        <div className="mt-8 rounded-2xl bg-white/70 p-6 shadow-sm">
          <p className="mb-4 text-center text-sm font-medium text-ink/70">เหลืออีก</p>
          <Countdown />
        </div>

        {/* ธีมงาน + การแต่งกาย + กำหนดการ */}
        <div className="mt-8 space-y-4">
          <DetailCard title="Theme · BACK TO SCHOOL" body={EVENT.themeDesc} />
          <DetailCard title="การแต่งกาย (Dress code)" body={EVENT.dressCodeFull} />
          <div className="rounded-2xl bg-white/70 p-6 shadow-sm">
            <p className="leading-relaxed text-ink/80"><span className="font-semibold text-orange">Date :</span> {EVENT.dateText}</p>
            <p className="mt-1 leading-relaxed text-ink/80"><span className="font-semibold text-orange">Time :</span> เริ่มลงทะเบียน 17.30 - 19.00 น. · งานเริ่มเวลา 19.00 - 22.00 น.</p>
          </div>
          <div className="rounded-2xl bg-white/70 p-6 shadow-sm">
            <p className="mb-3 font-display text-lg font-bold text-orange">กำหนดการ</p>
            <ul className="space-y-2 text-ink/80">
              <li className="flex gap-3"><span className="font-semibold text-orange">17.30</span><span>เริ่มลงทะเบียนหน้างาน (ถึง 19.00 น.)</span></li>
              <li className="flex gap-3"><span className="font-semibold text-orange">19.00</span><span>เริ่มงาน (ถึง 22.00 น.)</span></li>
            </ul>
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
