// ระบุตัวตนด้วย "รหัสนักศึกษา" หรือ "ชื่อ-นามสกุล + passcode 4 หลัก"
// เก็บ identifier (+passcode ถ้าลงด้วยชื่อ) ไว้ใน localStorage เพื่อกลับมาดูตั๋วได้
const KEY = 'bio69_session'

export interface Session {
  id: string // รหัสนักศึกษา หรือ ชื่อ-นามสกุล (ใช้เป็น key)
  passcode?: string // 4 หลัก (เฉพาะคนลงด้วยชื่อ)
}

export function getSession(): Session | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function setSession(s: Session) {
  localStorage.setItem(KEY, JSON.stringify({ id: s.id.trim(), passcode: s.passcode || '' }))
}

export function clearSession() {
  localStorage.removeItem(KEY)
}

// รหัสนักศึกษา = ขึ้นต้นด้วยเลข ตามด้วยเลข/ขีด (ไม่ใช่ → ถือเป็น "ชื่อ")
export function isStudentId(v: string): boolean {
  return /^[0-9][0-9-]{6,14}$/.test(v.trim())
}
