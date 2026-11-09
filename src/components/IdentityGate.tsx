import { useState } from 'react'
import { EVENT } from '../config/event'
import { isStudentId } from '../lib/session'

// ฟอร์มระบุตัวตน: รหัสนักศึกษา หรือ ชื่อ-นามสกุล (+ passcode 4 หลักสำหรับคนลงด้วยชื่อ)
export default function IdentityGate({
  title,
  subtitle,
  submitLabel,
  requireConsent,
  passcodeMode = 'enter',
  loading,
  error,
  onSubmit,
}: {
  title: string
  subtitle: string
  submitLabel: string
  requireConsent: boolean
  passcodeMode?: 'set' | 'enter' // set = ตั้งรหัสตอนลงทะเบียน, enter = กรอกตอนกลับมา
  loading?: boolean
  error?: string | null
  onSubmit: (id: string, passcode?: string) => void
}) {
  const [id, setId] = useState('')
  const [passcode, setPasscode] = useState('')
  const [consent, setConsent] = useState(false)
  const [localErr, setLocalErr] = useState<string | null>(null)

  const value = id.trim()
  const student = isStudentId(value)
  const needPasscode = value.length > 0 && !student

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!value) {
      setLocalErr('กรอกรหัสนักศึกษา หรือ ชื่อ-นามสกุล')
      return
    }
    if (needPasscode && !/^\d{4}$/.test(passcode)) {
      setLocalErr('กรอกรหัส passcode เป็นตัวเลข 4 หลัก')
      return
    }
    if (requireConsent && !consent) {
      setLocalErr('กรุณายอมรับเงื่อนไขก่อนดำเนินการต่อ')
      return
    }
    setLocalErr(null)
    onSubmit(value, student ? undefined : passcode)
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md rounded-2xl bg-white/85 p-8 shadow-warm">
      <h1 className="mb-1 font-display text-2xl font-bold text-ink">{title}</h1>
      <p className="mb-6 text-ink/70">{subtitle}</p>

      <label className="label">รหัสนักศึกษา หรือ ชื่อ-นามสกุล</label>
      <input
        className="field text-lg"
        autoFocus
        placeholder="เช่น 643020123-4 หรือ อ.สมชาย ใจดี"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <p className="mt-1 text-xs text-ink/50">อาจารย์ / ศิษย์เก่า ที่ไม่มีรหัสนักศึกษา ใส่ชื่อ-นามสกุลได้</p>

      {needPasscode && (
        <div className="mt-4">
          <label className="label">
            {passcodeMode === 'set' ? 'ตั้งรหัส passcode 4 หลัก (ไว้กลับมาดูตั๋ว)' : 'รหัส passcode 4 หลัก'}
          </label>
          <input
            className="field text-center text-xl tracking-[0.5em]"
            inputMode="numeric"
            maxLength={4}
            placeholder="● ● ● ●"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
          />
          {passcodeMode === 'set' && (
            <p className="mt-1 text-xs text-orangeDeep">จดไว้ให้ดี ต้องใช้รหัสนี้กลับมาดู/แก้ตั๋วภายหลัง</p>
          )}
        </div>
      )}

      {requireConsent && (
        <label className="mt-5 flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 accent-orange"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span className="text-sm text-ink/70">
            ยินยอมให้เก็บและใช้ข้อมูลเพื่อการจัดงาน{EVENT.name} เท่านั้น ข้อมูลจะไม่ถูกเผยแพร่ต่อบุคคลภายนอก (PDPA)
          </span>
        </label>
      )}

      {(localErr || error) && (
        <p className="mt-4 rounded-xl bg-orange/10 px-4 py-3 text-sm text-orangeDeep">{localErr || error}</p>
      )}

      <button type="submit" className="btn-primary mt-6 w-full py-4 text-lg" disabled={loading}>
        {loading ? 'กำลังตรวจสอบ…' : submitLabel}
      </button>
    </form>
  )
}
