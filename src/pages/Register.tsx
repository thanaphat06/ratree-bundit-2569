import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '../lib/zodResolver'
import { registerSchema, type RegisterForm } from '../lib/schema'
import { DEFAULT_FACULTY, DEFAULT_MAJOR, EVENT, FOOD_TYPES, YEAR_LEVELS, isRegistrationClosed } from '../config/event'
import { register } from '../lib/api'
import { setSession } from '../lib/session'
import TicketCanvas from '../components/TicketCanvas'
import type { TicketData } from '../lib/ticket'

const STEPS = ['ข้อมูลส่วนตัว', 'ติดต่อ & อาหาร']

export default function Register() {
  const nav = useNavigate()

  if (isRegistrationClosed()) {
    return (
      <Shell>
        <div className="mx-auto max-w-md rounded-2xl bg-white/80 p-8 text-center shadow-warm">
          <h1 className="mb-2 font-display text-2xl font-bold text-orange">ปิดรับลงทะเบียนแล้ว</h1>
          <p className="text-ink/70">ขอบคุณที่ให้ความสนใจ แล้วพบกันในงาน 🎓</p>
        </div>
      </Shell>
    )
  }

  return <RegisterWizard onDone={() => nav('/ticket')} />
}

function RegisterWizard({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [passcode, setPasscode] = useState('')
  const [consent, setConsent] = useState(false)
  const [extraErr, setExtraErr] = useState<string | null>(null)

  const {
    register: field,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      first_name: '',
      last_name: '',
      nickname: '',
      student_id: '',
      year_level: '',
      major: DEFAULT_MAJOR,
      faculty: DEFAULT_FACULTY,
      phone: '',
      line_id: '',
      instagram: '',
      food_type: 'ทั่วไป',
      food_allergy: '',
      bio: '',
      show_photo_on_ticket: true,
    },
  })

  const v = watch()
  const hasSid = !!(v.student_id || '').trim() // มีรหัสนักศึกษาไหม → ถ้าไม่มีต้องตั้ง passcode
  const preview: TicketData = useMemo(
    () => ({
      ticket_id: `${EVENT.ticketPrefix}-XXXX`,
      nickname: v.nickname || 'ชื่อเล่น',
      first_name: v.first_name || 'ชื่อ',
      last_name: v.last_name || 'นามสกุล',
      student_id: v.student_id || '-',
      year_level: v.year_level || '-',
    }),
    [v.nickname, v.first_name, v.last_name, v.student_id, v.year_level],
  )

  const fieldsByStep: (keyof RegisterForm)[][] = [
    ['first_name', 'last_name', 'nickname', 'student_id', 'year_level', 'major', 'faculty'],
    ['phone', 'line_id', 'instagram', 'food_type', 'food_allergy', 'bio'],
  ]

  const next = async () => {
    const okForm = await trigger(fieldsByStep[step])
    // ขั้นแรก: ถ้าไม่มีรหัส นศ. ต้องตั้ง passcode + ต้องยอมรับ PDPA ก่อนไปต่อ
    if (step === 0) {
      if (!hasSid && !/^\d{4}$/.test(passcode)) {
        setExtraErr('ไม่มีรหัสนักศึกษา ต้องตั้งรหัส 4 หลักไว้กลับมาดูตั๋ว')
        return
      }
      if (!consent) {
        setExtraErr('กรุณายอมรับเงื่อนไข PDPA ก่อนไปต่อ')
        return
      }
    }
    setExtraErr(null)
    if (okForm) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const onSubmit = async (data: RegisterForm) => {
    setApiError(null)
    setExtraErr(null)
    const sid = (data.student_id || '').trim()
    const key = sid || `${data.first_name} ${data.last_name}`.trim()
    const pass = sid ? '' : passcode
    if (!sid && !/^\d{4}$/.test(pass)) {
      setStep(0)
      setExtraErr('ไม่มีรหัสนักศึกษา ต้องตั้งรหัส 4 หลักไว้กลับมาดูตั๋ว')
      return
    }
    if (!consent) {
      setExtraErr('กรุณายอมรับเงื่อนไข PDPA ก่อนยืนยัน')
      return
    }
    setSubmitting(true)
    const r = await register({ ...data, student_id: key, passcode: pass })
    setSubmitting(false)
    if (r.ok) {
      setSession({ id: key, passcode: pass })
      onDone()
    } else {
      setApiError(r.message || 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง')
    }
  }

  return (
    <Shell>
      <div className="mx-auto max-w-4xl">
        <ol className="mb-6 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  i <= step ? 'bg-orange text-white' : 'bg-white text-ink/40 ring-1 ring-stone/20'
                }`}
              >
                {i + 1}
              </span>
              <span className={`hidden text-sm sm:inline ${i === step ? 'font-semibold text-ink' : 'text-ink/50'}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && <span className="h-px w-6 bg-stone/30" />}
            </li>
          ))}
        </ol>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl bg-white/80 p-6 shadow-sm sm:p-8">
            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="ชื่อ" error={errors.first_name?.message}>
                  <input className="field" {...field('first_name')} />
                </Field>
                <Field label="นามสกุล" error={errors.last_name?.message}>
                  <input className="field" {...field('last_name')} />
                </Field>
                <Field label="ชื่อเล่น (แสดงตัวใหญ่บนตั๋ว)" error={errors.nickname?.message}>
                  <input className="field" {...field('nickname')} />
                </Field>
                <Field label="รหัสนักศึกษา (อาจารย์/ศิษย์เก่าเว้นว่างได้)" error={errors.student_id?.message}>
                  <input className="field" inputMode="text" placeholder="เช่น 643020123-4" {...field('student_id')} />
                </Field>
                <Field label="ชั้นปี / สถานะ" error={errors.year_level?.message}>
                  <select className="field" {...field('year_level')} defaultValue="">
                    <option value="" disabled>เลือกชั้นปี</option>
                    {YEAR_LEVELS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </Field>
                <Field label="สาขาวิชา" error={errors.major?.message}>
                  <input className="field bg-cream/60" readOnly {...field('major')} />
                </Field>
                <Field label="คณะ" error={errors.faculty?.message}>
                  <input className="field" {...field('faculty')} />
                </Field>

                {/* ไม่มีรหัสนักศึกษา → ตั้งรหัส 4 หลักไว้กลับมาดูตั๋ว */}
                {!hasSid && (
                  <div className="sm:col-span-2">
                    <Field label="ตั้งรหัส 4 หลัก (สำหรับผู้ไม่มีรหัสนักศึกษา ไว้กลับมาดู/แก้ตั๋ว)">
                      <input
                        className="field text-center text-xl tracking-[0.5em]"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="● ● ● ●"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      />
                    </Field>
                    <p className="mt-1 text-xs text-orangeDeep">จดรหัสนี้ไว้ให้ดี ต้องใช้กลับมาดูตั๋วภายหลัง</p>
                  </div>
                )}

                {/* PDPA — อยู่หน้าแรกของฟอร์ม ต้องยอมรับก่อนไปต่อ */}
                <label className="sm:col-span-2 flex items-start gap-3 rounded-xl bg-cream px-4 py-3">
                  <input type="checkbox" className="mt-1 h-5 w-5 accent-orange" checked={consent} onChange={(e) => { setConsent(e.target.checked); setExtraErr(null) }} />
                  <span className="text-sm text-ink/70">
                    ยินยอมให้เก็บและใช้ข้อมูลเพื่อการจัดงาน{EVENT.name} เท่านั้น ข้อมูลจะไม่ถูกเผยแพร่ต่อบุคคลภายนอก (PDPA)
                  </span>
                </label>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="เบอร์โทรศัพท์" error={errors.phone?.message}>
                  <input className="field" inputMode="numeric" placeholder="0812345678" {...field('phone')} />
                </Field>
                <Field label="LINE ID (ไม่บังคับ)" error={errors.line_id?.message}>
                  <input className="field" {...field('line_id')} />
                </Field>
                <Field label="Instagram (ไม่บังคับ)" error={errors.instagram?.message}>
                  <input className="field" {...field('instagram')} />
                </Field>
                <Field label="ประเภทอาหาร" error={errors.food_type?.message}>
                  <select className="field" {...field('food_type')}>
                    {FOOD_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="อาหารที่แพ้ / ข้อจำกัด (ไม่บังคับ)" error={errors.food_allergy?.message}>
                    <input className="field" placeholder="เช่น กุ้ง, ถั่ว" {...field('food_allergy')} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="ข้อความสั้น ๆ ถึงเพื่อน (ไม่บังคับ, ≤ 120)" error={errors.bio?.message}>
                    <textarea className="field" rows={2} maxLength={120} {...field('bio')} />
                  </Field>
                </div>
              </div>
            )}

            {(extraErr || apiError) && (
              <p className="mt-4 rounded-xl bg-orange/10 px-4 py-3 text-sm text-orangeDeep">{extraErr || apiError}</p>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                className="btn-ghost disabled:opacity-40"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                ย้อนกลับ
              </button>
              {step < STEPS.length - 1 ? (
                <button type="button" className="btn-primary" onClick={next}>ถัดไป</button>
              ) : (
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'กำลังบันทึก…' : 'ยืนยันรับตั๋ว'}
                </button>
              )}
            </div>
          </form>

          <div className="lg:w-[320px]">
            <p className="mb-2 text-center text-sm font-medium text-ink/60">ตัวอย่างตั๋วของคุณ</p>
            <TicketCanvas data={preview} />
          </div>
        </div>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen paper-grid px-4 py-10">{children}</div>
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="err">{error}</p>}
    </div>
  )
}
