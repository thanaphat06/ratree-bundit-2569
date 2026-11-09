import type { FoodType } from '../config/event'

// ข้อมูลที่ผู้ใช้กรอก (ตรงกับคอลัมน์ Sheet ฝั่งที่ผู้ใช้แก้ได้)
export interface ProfileInput {
  first_name: string
  last_name: string
  nickname: string
  student_id: string
  year_level: string
  major: string
  faculty: string
  phone: string
  line_id?: string
  instagram?: string
  food_type: FoodType
  food_allergy?: string
  bio?: string
  show_photo_on_ticket: boolean
  // base64 (data URL) รูปที่เพิ่งครอป — ส่งเฉพาะตอนมีรูปใหม่
  imageBase64?: string | null
}

// record ที่ backend คืนกลับมา (รวม field อัตโนมัติ)
export interface Registration extends ProfileInput {
  ticket_id: string
  created_at: string
  updated_at: string
  status: 'registered' | 'checked_in' | 'cancelled'
  // base64 รูปโปรไฟล์ (backend ส่งกลับมาเพื่อเลี่ยง CORS ตอนวาดตั๋ว) — อาจไม่มี
  profile_image_base64?: string | null
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; message: string }
