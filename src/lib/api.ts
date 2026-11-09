// เรียก Apps Script Web App
// ⚠️ POST ด้วย Content-Type: text/plain เพื่อเลี่ยง CORS preflight (Apps Script ไม่รับ preflight)
import { API_URL } from '../config/event'
import type { ApiResult, ProfileInput, Registration } from './types'

async function call<T>(action: string, payload: Record<string, unknown> = {}): Promise<ApiResult<T>> {
  if (!API_URL) {
    return { ok: false, error: 'NO_API_URL', message: 'ยังไม่ได้ตั้ง VITE_API_URL ใน .env' }
  }
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload }),
    })
    return (await res.json()) as ApiResult<T>
  } catch {
    return { ok: false, error: 'NETWORK', message: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองใหม่อีกครั้ง' }
  }
}

// ข้อมูลผู้ลงทะเบียนจากรหัสนักศึกษา หรือ null ถ้ายังไม่ลงทะเบียน
export function getMe(studentId: string) {
  return call<Registration | null>('getMe', { student_id: studentId })
}

export function register(form: ProfileInput) {
  return call<Registration>('register', { ...form })
}

export function updateProfile(studentId: string, fields: Partial<ProfileInput>) {
  return call<Registration>('updateProfile', { student_id: studentId, ...fields })
}

export function deleteMe(studentId: string) {
  return call<{ deleted: boolean }>('deleteMe', { student_id: studentId })
}

export function getStats() {
  return call<{ total: number }>('getStats')
}
