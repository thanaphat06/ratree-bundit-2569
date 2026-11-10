import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EVENT, DEFAULT_FACULTY, DEFAULT_MAJOR, FOOD_TYPES, MAJORS, YEAR_LEVELS } from '../config/event'
import { deleteMe, getMe, updateProfile } from '../lib/api'
import { clearSession, getSession, setSession, isStudentId, type Session } from '../lib/session'
import { useForm } from 'react-hook-form'
import { zodResolver } from '../lib/zodResolver'
import { registerSchema, type RegisterForm } from '../lib/schema'
import TicketCanvas, { type TicketCanvasHandle } from '../components/TicketCanvas'
import IdentityGate from '../components/IdentityGate'
import SiteFooter from '../components/SiteFooter'
import { downloadTicket, ticketFilename, type TicketData } from '../lib/ticket'
import type { Registration } from '../lib/types'

export default function Ticket() {
  const nav = useNavigate()
  const [session, setSessionState] = useState<Session | null>(getSession())
  const [rec, setRec] = useState<Registration | null>(null)
  const [loading, setLoading] = useState(!!getSession())
  const [gateLoading, setGateLoading] = useState(false)
  const [gateError, setGateError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [dlNote, setDlNote] = useState<string | null>(null)
  const [saveImg, setSaveImg] = useState<string | null>(null)
  const canvasRef = useRef<TicketCanvasHandle>(null)

  // โหลดตั๋วจาก session ที่จำไว้
  useEffect(() => {
    if (!session) return
    setLoading(true)
    getMe(session.id, session.passcode).then((r) => {
      setLoading(false)
      if (r.ok && r.data) {
        setRec(r.data)
      } else if (r.ok && !r.data) {
        clearSession()
        setSessionState(null)
      }
      // ถ้า passcode ผิด (ไม่ ok) ปล่อยให้ค้าง แล้วผู้ใช้กดออกเพื่อกรอกใหม่
    })
  }, [session])

  // ด่านรหัสนักศึกษา/ชื่อ (ยังไม่มี session)
  if (!session) {
    const onGate = async (id: string, passcode?: string) => {
      setGateError(null)
      setGateLoading(true)
      const r = await getMe(id, passcode)
      setGateLoading(false)
      if (!r.ok) return setGateError(r.message)
      if (!r.data) return setGateError('ไม่พบการลงทะเบียนของรหัส/ชื่อนี้ กรุณาลงทะเบียนก่อน')
      setSession({ id, passcode })
      setRec(r.data)
      setSessionState({ id, passcode })
    }
    return (
      <Shell>
        <IdentityGate
          title="ดูตั๋วของฉัน"
          subtitle="กรอกรหัสนักศึกษา หรือ ชื่อ-นามสกุล ที่ใช้ลงทะเบียนไว้"
          submitLabel="ดูตั๋ว"
          requireConsent={false}
          passcodeMode="enter"
          loading={gateLoading}
          error={gateError}
          onSubmit={onGate}
        />
        <div className="mt-4 text-center">
          <button className="text-sm text-ink/60 underline-offset-2 hover:underline" onClick={() => nav('/register')}>
            ยังไม่ได้ลงทะเบียน? ลงทะเบียนที่นี่
          </button>
        </div>
      </Shell>
    )
  }

  if (loading) return <Shell><Card><p className="text-ink/60">กำลังโหลด…</p></Card></Shell>
  if (!rec) return <Shell><Card><p className="text-ink/60">กำลังโหลด…</p></Card></Shell>

  const signOut = () => {
    clearSession()
    setSessionState(null)
    setRec(null)
  }

  const ticketData: TicketData = {
    ticket_id: rec.ticket_id,
    first_name: rec.first_name,
    last_name: rec.last_name,
    nickname: rec.nickname,
    student_id: rec.student_id,
    year_level: rec.year_level,
  }

  const onDownload = async () => {
    const canvas = canvasRef.current?.getCanvas()
    if (!canvas) return
    const r = await downloadTicket(canvas, ticketFilename(ticketData))
    if (r.mode === 'longpress') {
      setSaveImg(r.dataUrl || null)
      setDlNote(null)
    } else {
      setDlNote(r.mode === 'shared' ? 'เลือก "บันทึกรูปภาพ" เพื่อเก็บตั๋วลงเครื่องได้เลย' : null)
    }
  }

  const onDelete = async () => {
    if (!window.confirm('ยืนยันลบข้อมูลการลงทะเบียนและตั๋วของคุณ?\nการลบนี้ย้อนกลับไม่ได้ (ลงทะเบียนใหม่ได้ภายหลัง)')) return
    const r = await deleteMe(rec.student_id, session.passcode)
    if (r.ok) {
      clearSession()
      alert('ลบข้อมูลเรียบร้อยแล้ว')
      nav('/')
    } else {
      alert(r.message || 'ลบไม่สำเร็จ ลองใหม่อีกครั้ง')
    }
  }

  if (editing) {
    return (
      <EditProfile
        rec={rec}
        passcode={session.passcode}
        onCancel={() => setEditing(false)}
        onSaved={(updated) => {
          setRec(updated)
          setEditing(false)
        }}
      />
    )
  }

  return (
    <Shell>
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-1 font-display text-3xl font-bold text-orange">ตั๋วของคุณ 🎟️</h1>
        <p className="mb-6 text-ink/70">{EVENT.name} · {EVENT.dateText}</p>

        <TicketCanvas ref={canvasRef} data={ticketData} />

        <div className="mt-6 space-y-3">
          <button className="btn-primary w-full py-4 text-lg" onClick={onDownload}>
            ดาวน์โหลดตั๋ว (PNG)
          </button>
          {dlNote && <p className="rounded-xl bg-gold/15 px-4 py-3 text-sm text-ink/70">{dlNote}</p>}

          <div className="flex gap-3">
            <button className="btn-ghost flex-1" onClick={() => setEditing(true)}>แก้ไขโปรไฟล์</button>
            <button className="btn-ghost" onClick={signOut}>ออกจากระบบ</button>
          </div>

          <button
            onClick={onDelete}
            className="mt-2 w-full rounded-2xl border border-red-300 bg-white/60 px-5 py-3 text-sm font-medium text-red-600 transition active:scale-95 hover:bg-red-50"
          >
            ลบข้อมูลการลงทะเบียน / ลบบัญชี
          </button>
        </div>
      </div>
      <SiteFooter />

      {/* iOS fallback: โชว์รูปให้กดค้างบันทึก */}
      {saveImg && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center overflow-auto bg-black/85 p-4"
          onClick={() => setSaveImg(null)}
        >
          <p className="mb-3 mt-1 rounded-full bg-white px-4 py-2 text-center text-sm font-medium text-ink">
            กดค้างที่รูป แล้วเลือก “บันทึกรูปภาพ”
          </p>
          <img
            src={saveImg}
            alt="ตั๋วของคุณ"
            className="w-full max-w-sm rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button className="mt-4 rounded-full bg-white px-8 py-2 font-medium text-ink" onClick={() => setSaveImg(null)}>
            ปิด
          </button>
        </div>
      )}
    </Shell>
  )
}

// ---------- แก้ไขโปรไฟล์ ----------
function EditProfile({
  rec,
  passcode,
  onCancel,
  onSaved,
}: {
  rec: Registration
  passcode?: string
  onCancel: () => void
  onSaved: (r: Registration) => void
}) {
  const isStudent = isStudentId(rec.student_id)
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      first_name: rec.first_name,
      last_name: rec.last_name,
      nickname: rec.nickname,
      student_id: rec.student_id,
      year_level: rec.year_level || '',
      major: MAJORS.includes(rec.major as any) ? rec.major : DEFAULT_MAJOR,
      faculty: rec.faculty || DEFAULT_FACULTY,
      phone: rec.phone,
      line_id: rec.line_id || '',
      instagram: rec.instagram || '',
      food_type: (FOOD_TYPES.includes(rec.food_type as any) ? rec.food_type : 'ทั่วไป') as RegisterForm['food_type'],
      food_allergy: rec.food_allergy || '',
      bio: rec.bio || '',
      show_photo_on_ticket: rec.show_photo_on_ticket,
    },
  })

  const onSubmit = async (data: RegisterForm) => {
    setApiError(null)
    setSaving(true)
    const r = await updateProfile(rec.student_id, { ...data }, passcode)
    setSaving(false)
    if (r.ok) onSaved(r.data)
    else setApiError(r.message)
  }

  return (
    <Shell>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-xl rounded-2xl bg-white/85 p-6 shadow-warm sm:p-8">
        <h1 className="mb-5 font-display text-2xl font-bold text-ink">แก้ไขโปรไฟล์</h1>

        <div className="grid gap-4 sm:grid-cols-2">
          <F label="ชื่อ" e={errors.first_name?.message}><input className="field" {...field('first_name')} /></F>
          <F label="นามสกุล" e={errors.last_name?.message}><input className="field" {...field('last_name')} /></F>
          <F label="ชื่อเล่น" e={errors.nickname?.message}><input className="field" {...field('nickname')} /></F>
          {isStudent && (
            <F label="รหัสนักศึกษา" e={errors.student_id?.message}><input className="field bg-cream/60" readOnly {...field('student_id')} /></F>
          )}
          <F label="ชั้นปี / สถานะ" e={errors.year_level?.message}>
            <select className="field" {...field('year_level')}>
              <option value="" disabled>เลือกชั้นปี</option>
              {YEAR_LEVELS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </F>
          <F label="สาขาวิชา" e={errors.major?.message}>
            <input className="field bg-cream/60" readOnly {...field('major')} />
          </F>
          <F label="คณะ" e={errors.faculty?.message}><input className="field" {...field('faculty')} /></F>
          <F label="เบอร์โทร" e={errors.phone?.message}><input className="field" inputMode="numeric" {...field('phone')} /></F>
          <F label="LINE ID" e={errors.line_id?.message}><input className="field" {...field('line_id')} /></F>
          <F label="Instagram" e={errors.instagram?.message}><input className="field" {...field('instagram')} /></F>
          <F label="ประเภทอาหาร" e={errors.food_type?.message}>
            <select className="field" {...field('food_type')}>
              {FOOD_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </F>
          <div className="sm:col-span-2">
            <F label="อาหารที่แพ้" e={errors.food_allergy?.message}><input className="field" {...field('food_allergy')} /></F>
          </div>
          <div className="sm:col-span-2">
            <F label="ข้อความสั้น ๆ (≤120)" e={errors.bio?.message}>
              <textarea className="field" rows={2} maxLength={120} {...field('bio')} />
            </F>
          </div>
        </div>

        {apiError && <p className="mt-4 rounded-xl bg-orange/10 px-4 py-3 text-sm text-orangeDeep">{apiError}</p>}

        <div className="mt-6 flex gap-3">
          <button type="button" className="btn-ghost flex-1" onClick={onCancel}>ยกเลิก</button>
          <button type="submit" className="btn-primary flex-1" disabled={saving}>
            {saving ? 'กำลังบันทึก…' : 'บันทึก & สร้างตั๋วใหม่'}
          </button>
        </div>
      </form>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen paper-grid px-4 py-10">{children}</div>
}
function Card({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-md rounded-2xl bg-white/80 p-8 text-center shadow-warm">{children}</div>
}
function F({ label, e, children }: { label: string; e?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {e && <p className="err">{e}</p>}
    </div>
  )
}
