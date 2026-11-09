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

// ข้อมูลผู้ลงทะเบียนจาก key (รหัส นศ./ชื่อ) + passcode (ถ้าลงด้วยชื่อ) หรือ null ถ้ายังไม่ลงทะเบียน
export function getMe(id: string, passcode?: string) {
  return call<Registration | null>('getMe', { student_id: id, passcode: passcode || '' })
}

export function register(form: ProfileInput) {
  return call<Registration>('register', { ...form })
}

export function updateProfile(id: string, fields: Partial<ProfileInput>, passcode?: string) {
  return call<Registration>('updateProfile', { student_id: id, passcode: passcode || '', ...fields })
}

export function deleteMe(id: string, passcode?: string) {
  return call<{ deleted: boolean }>('deleteMe', { student_id: id, passcode: passcode || '' })
}

export interface CheckinResult {
  already: boolean
  ticket_id: string
  student_id: string
  first_name: string
  last_name: string
  nickname: string
  year_level: string
  food_type: string
  checked_in_at: string
}
export function checkin(studentId: string) {
  return call<CheckinResult>('checkin', { student_id: studentId })
}

export function getStats() {
  return call<{ total: number }>('getStats')
}
