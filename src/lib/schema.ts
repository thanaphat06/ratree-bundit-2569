import { z } from 'zod'
import { FOOD_TYPES } from '../config/event'

export const registerSchema = z.object({
  first_name: z.string().trim().min(1, 'กรอกชื่อ'),
  last_name: z.string().trim().min(1, 'กรอกนามสกุล'),
  nickname: z.string().trim().min(1, 'กรอกชื่อเล่น').max(20, 'ชื่อเล่นไม่เกิน 20 ตัวอักษร'),
  // รหัสนักศึกษา — ไม่บังคับ (อาจารย์/ศิษย์เก่าเว้นว่างได้); key คำนวณตอน submit
  student_id: z.string().trim().max(60).optional().or(z.literal('')),
  year_level: z.string().trim().min(1, 'เลือกชั้นปี'),
  major: z.string().trim().min(1, 'เลือกสาขา'),
  faculty: z.string().trim().min(1, 'กรอกคณะ'),
  phone: z.string().trim().regex(/^0\d{9}$/, 'เบอร์โทร 10 หลัก ขึ้นต้น 0'),
  line_id: z.string().trim().max(60).optional().or(z.literal('')),
  instagram: z.string().trim().max(60).optional().or(z.literal('')),
  food_type: z.enum(FOOD_TYPES),
  food_allergy: z.string().trim().max(120).optional().or(z.literal('')),
  bio: z.string().trim().max(120, 'ข้อความไม่เกิน 120 ตัวอักษร').optional().or(z.literal('')),
  show_photo_on_ticket: z.boolean(),
})

export type RegisterForm = z.infer<typeof registerSchema>
