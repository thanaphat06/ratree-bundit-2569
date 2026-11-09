import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EVENT, DEFAULT_FACULTY, DEFAULT_MAJOR, FOOD_TYPES, MAJORS, YEAR_LEVELS } from '../config/event'
import { deleteMe, getMe, updateProfile } from '../lib/api'
import { clearSid, getSid, setSid } from '../lib/session'
import { useForm } from 'react-hook-form'
import { zodResolver } from '../lib/zodResolver'
import { registerSchema, type RegisterForm } from '../lib/schema'
import TicketCanvas, { type TicketCanvasHandle } from '../components/TicketCanvas'
import PhotoUploader from '../components/PhotoUploader'
import IdentityGate from '../components/IdentityGate'
import SiteFooter from '../components/SiteFooter'
import { downloadTicket, ticketFilename, type TicketData } from '../lib/ticket'
import type { Registration } from '../lib/types'

export default function Ticket() {
  const nav = useNavigate()
  const [sid, setSidState] = useState<string | null>(getSid())
  const [rec, setRec] = useState<Registration | null>(null)
  const [loading, setLoading] = useState(!!getSid())
  const [gateLoading, setGateLoading] = useState(false)
  const [gateError, setGateError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [dlNote, setDlNote] = useState<string | null>(null)
  const canvasRef = useRef<TicketCanvasHandle>(null)

  // โหลดตั๋วจากรหัสที่จำไว้
  useEffect(() => {
    if (!sid) return
    setLoading(true)
    getMe(sid).then((r) => {
      setLoading(false)
      if (r.ok && r.data) {
        setRec(r.data)
      } else if (r.ok && !r.data) {
        // รหัสนี้ยังไม่ลงทะเบียน
        clearSid()
        setSidState(null)
      }
    })
  }, [sid])

  // ด่านรหัสนักศึกษา (ยังไม่มี session)
  if (!sid) {
    const onGate = async (id: string) => {
      setGateError(null)
      setGateLoading(true)
      const r = await getMe(id)
      setGateLoading(false)
      if (!r.ok) return setGateError(r.message)
      if (!r.data) return setGateError('ไม่พบการลงทะเบียนของรหัสนี้ กรุณาลงทะเบียนก่อน')
      setSid(id)
      setRec(r.data)
      setSidState(id)
    }
    return (
      <Shell>
        <IdentityGate
          title="ดูตั๋วของฉัน"
          subtitle="กรอกรหัสนักศึกษาที่ใช้ลงทะเบียนไว้"
          submitLabel="ดูตั๋ว"
          requireConsent={false}
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
    clearSid()
    setSidState(null)
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
    const mode = await downloadTicket(canvas, ticketFilename(ticketData))
    setDlNote(mode === 'newtab' ? 'เปิดรูปในแท็บใหม่แล้ว — กดค้างที่รูปเพื่อบันทึกลงเครื่อง' : null)
  }

  const onDelete = async () => {
    if (!window.confirm('ยืนยันลบข้อมูลการลงทะเบียนและตั๋วของคุณ?\nการลบนี้ย้อนกลับไม่ได้ (ลงทะเบียนใหม่ได้ภายหลัง)')) return
    const r = await deleteMe(rec.student_id)
    if (r.ok) {
      clearSid()
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
    </Shell>
  )
}

// ---------- แก้ไขโปรไฟล์ ----------
function EditProfile({
  rec,
  onCancel,
  onSaved,
}: {
  rec: Registration
  onCancel: () => void
  onSaved: (r: Registration) => void
}) {
  const [image, setImage] = useState<string | null>(rec.profile_image_base64 || null)
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const imageChanged = useRef(false)

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
    const r = await updateProfile(rec.student_id, {
      ...data,
      imageBase64: imageChanged.current ? image : undefined,
    })
    setSaving(false)
    if (r.ok) onSaved(r.data)
    else setApiError(r.message)
  }

  return (
    <Shell>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-xl rounded-2xl bg-white/85 p-6 shadow-warm sm:p-8">
        <h1 className="mb-5 font-display text-2xl font-bold text-ink">แก้ไขโปรไฟล์</h1>

        <PhotoUploader
          value={image}
          onChange={(v) => {
            imageChanged.current = true
            setImage(v)
          }}
        />

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <F label="ชื่อ" e={errors.first_name?.message}><input className="field" {...field('first_name')} /></F>
          <F label="นามสกุล" e={errors.last_name?.message}><input className="field" {...field('last_name')} /></F>
          <F label="ชื่อเล่น" e={errors.nickname?.message}><input className="field" {...field('nickname')} /></F>
          <F label="รหัสนักศึกษา" e={errors.student_id?.message}><input className="field bg-cream/60" readOnly {...field('student_id')} /></F>
          <F label="ชั้นปี" e={errors.year_level?.message}>
            <select className="field" {...field('year_level')}>
              <option value="" disabled>เลือกชั้นปี</option>
              {YEAR_LEVELS.map((y) => <option key={y} value={y}>ปี {y}</option>)}
            </select>
          </F>
          <F label="สาขา" e={errors.major?.message}>
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
