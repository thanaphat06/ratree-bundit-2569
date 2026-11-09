import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { checkin, type CheckinResult } from '../lib/api'
import { EVENT } from '../config/event'

const ADMIN_PW = '0000'
const SCAN_COOLDOWN = 2500

type Outcome =
  | { kind: 'new'; data: CheckinResult }
  | { kind: 'already'; data: CheckinResult }
  | { kind: 'error'; message: string }

export default function Admin() {
  const nav = useNavigate()
  const [authed, setAuthed] = useState(sessionStorage.getItem('bio69_admin') === '1')
  const [pw, setPw] = useState('')
  const [pwErr, setPwErr] = useState(false)

  if (!authed) {
    return (
      <Shell>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (pw === ADMIN_PW) {
              sessionStorage.setItem('bio69_admin', '1')
              setAuthed(true)
            } else setPwErr(true)
          }}
          className="mx-auto max-w-sm rounded-2xl bg-white/90 p-8 text-center shadow-warm"
        >
          <h1 className="mb-1 font-display text-2xl font-bold text-ink">สำหรับผู้จัดงาน</h1>
          <p className="mb-6 text-ink/60">ใส่รหัสผ่านเพื่อเข้าหน้าสแกนเช็คอิน</p>
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            className="field text-center text-xl tracking-widest"
            placeholder="รหัสผ่าน"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value)
              setPwErr(false)
            }}
          />
          {pwErr && <p className="err">รหัสผ่านไม่ถูกต้อง</p>}
          <button type="submit" className="btn-primary mt-5 w-full py-3">เข้าสู่ระบบผู้จัด</button>
          <button type="button" className="mt-3 text-sm text-ink/50 hover:underline" onClick={() => nav('/')}>
            กลับหน้าแรก
          </button>
        </form>
      </Shell>
    )
  }

  return <Scanner onExit={() => { sessionStorage.removeItem('bio69_admin'); setAuthed(false) }} />
}

function Scanner({ onExit }: { onExit: () => void }) {
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [busy, setBusy] = useState(false)
  const [manual, setManual] = useState('')
  const [camError, setCamError] = useState<string | null>(null)
  const lastRef = useRef<{ code: string; t: number }>({ code: '', t: 0 })
  const busyRef = useRef(false)
  const clearTimer = useRef<number | undefined>(undefined)

  // เช็คอิน โดยกล้องยังเปิดอยู่ตลอด — ผลลัพธ์ขึ้นชั่วคราวแล้วกลับไปสแกนต่อทันที
  const doCheckin = async (studentId: string) => {
    const id = studentId.trim()
    if (!id || busyRef.current) return
    busyRef.current = true
    setBusy(true)
    const r = await checkin(id)
    setBusy(false)
    let ok = false
    if (r.ok) {
      ok = true
      setOutcome(r.data.already ? { kind: 'already', data: r.data } : { kind: 'new', data: r.data })
    } else {
      setOutcome({ kind: 'error', message: r.message })
    }
    // ผ่าน → เคลียร์เร็ว กลับไปสแกนทันที, ไม่ผ่าน → ค้างสีแดงนานกว่า
    window.clearTimeout(clearTimer.current)
    clearTimer.current = window.setTimeout(() => {
      setOutcome(null)
      lastRef.current = { code: '', t: 0 } // ให้สแกนคนถัดไป (หรือคนเดิมซ้ำ) ได้
      busyRef.current = false
    }, ok ? 1800 : 3000)
  }

  // เปิดกล้องครั้งเดียว ค้างไว้ตลอด
  useEffect(() => {
    const q = new Html5Qrcode('qr-reader', { verbose: false })
    q.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 240, height: 240 } },
      (text) => {
        const now = Date.now()
        if (busyRef.current) return
        if (text === lastRef.current.code && now - lastRef.current.t < SCAN_COOLDOWN) return
        lastRef.current = { code: text, t: now }
        doCheckin(text)
      },
      () => { /* ignore per-frame decode errors */ },
    ).catch((e) => {
      setCamError('เปิดกล้องไม่ได้: ' + (e?.message || e) + ' — ใช้ช่องกรอกรหัสด้านล่างแทนได้')
    })
    return () => {
      window.clearTimeout(clearTimer.current)
      q.stop().then(() => q.clear()).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Shell>
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-ink">สแกนเช็คอิน</h1>
          <button className="text-sm text-ink/50 hover:underline" onClick={onExit}>ออกจากระบบผู้จัด</button>
        </div>

        {/* กล้อง (เปิดค้างตลอด) */}
        <div className="overflow-hidden rounded-2xl bg-black shadow-warm">
          <div id="qr-reader" className="w-full" />
        </div>
        <p className="mt-2 text-center text-sm text-ink/50">หันกล้องไปที่ QR บนตั๋ว — เช็คอินอัตโนมัติ</p>

        {camError && <p className="mt-3 rounded-xl bg-orange/10 px-4 py-3 text-sm text-orangeDeep">{camError}</p>}
        {busy && <p className="mt-3 text-center text-ink/60">กำลังเช็คอิน…</p>}

        {/* ผลลัพธ์ (ขึ้นชั่วคราว) */}
        {outcome && <ResultCard outcome={outcome} />}

        {/* กรอกมือ (สำรอง) */}
        <form
          onSubmit={(e) => { e.preventDefault(); doCheckin(manual); setManual('') }}
          className="mt-5 rounded-2xl bg-white/80 p-4 shadow-sm"
        >
          <label className="label">กรอกรหัสนักศึกษาเอง (กรณีสแกนไม่ได้)</label>
          <div className="flex gap-2">
            <input className="field" inputMode="numeric" placeholder="เช่น 673020001-9" value={manual} onChange={(e) => setManual(e.target.value)} />
            <button type="submit" className="btn-primary px-5">เช็คอิน</button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-ink/40">{EVENT.name} · ระบบเช็คอินสำหรับผู้จัดงาน</p>
      </div>
    </Shell>
  )
}

function ResultCard({ outcome }: { outcome: Outcome }) {
  if (outcome.kind === 'error') {
    return (
      <Box className="border-red-400 bg-red-50">
        <p className="text-4xl">❌</p>
        <p className="mt-1 text-xl font-bold text-red-600">ไม่ผ่าน</p>
        <p className="text-ink/70">{outcome.message}</p>
      </Box>
    )
  }
  const d = outcome.data
  const already = outcome.kind === 'already'
  return (
    <Box className="border-green-400 bg-green-50">
      <p className="text-4xl">✅</p>
      <p className="mt-1 text-xl font-bold text-green-700">ลงทะเบียนแล้ว</p>
      {already && <p className="text-sm font-medium text-amber-600">(เคยเช็คอินไปแล้วก่อนหน้านี้)</p>}
      <div className="mt-3 space-y-0.5 text-ink">
        <p className="text-xl font-bold">{d.nickname} <span className="text-base font-normal text-ink/60">({d.first_name} {d.last_name})</span></p>
        <p className="text-sm text-ink/70">รหัส {d.student_id} · ปี {d.year_level} · อาหาร {d.food_type}</p>
      </div>
    </Box>
  )
}

function Box({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`mt-4 rounded-2xl border-2 p-5 text-center shadow-sm ${className || ''}`}>{children}</div>
}
function Shell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen paper-grid px-4 py-10">{children}</div>
}
