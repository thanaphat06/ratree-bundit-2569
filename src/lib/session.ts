// ระบุตัวตนด้วยรหัสนักศึกษา (ไม่มี Google) — เก็บรหัสที่ล็อกอินไว้ใน localStorage
const KEY = 'bio69_sid'

export function getSid(): string | null {
  return localStorage.getItem(KEY)
}
export function setSid(id: string) {
  localStorage.setItem(KEY, id.trim())
}
export function clearSid() {
  localStorage.removeItem(KEY)
}
