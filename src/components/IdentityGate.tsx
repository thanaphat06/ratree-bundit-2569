import { useState } from 'react'
import { EVENT } from '../config/event'

// ฟอร์มระบุตัวตนด้วยรหัสนักศึกษา (+ ขอความยินยอม PDPA ถ้า requireConsent)
export default function IdentityGate({
  title,
  subtitle,
  submitLabel,
  requireConsent,
  loading,
  error,
  onSubmit,
}: {
  title: string
  subtitle: string
  submitLabel: string
  requireConsent: boolean
  loading?: boolean
  error?: string | null
  onSubmit: (studentId: string) => void
}) {
  const [id, setId] = useState('')
  const [consent, setConsent] = useState(false)
  const [localErr, setLocalErr] = useState<string | null>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const v = id.trim()
    if (!/^[0-9][0-9-]{6,14}$/.test(v)) {
      setLocalErr('กรอกรหัสนักศึกษาให้ถูกต้อง')
      return
    }
    if (requireConsent && !consent) {
      setLocalErr('กรุณายอมรับเงื่อนไขก่อนดำเนินการต่อ')
      return
    }
    setLocalErr(null)
    onSubmit(v)
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md rounded-2xl bg-white/85 p-8 shadow-warm">
      <h1 className="mb-1 font-display text-2xl font-bold text-ink">{title}</h1>
      <p className="mb-6 text-ink/70">{subtitle}</p>

      <label className="label">รหัสนักศึกษา</label>
      <input
        className="field text-lg tracking-wide"
        inputMode="numeric"
        autoFocus
        placeholder="เช่น 643020123-4"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />

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
