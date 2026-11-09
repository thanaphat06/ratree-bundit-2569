// ข้อมูลงานทั้งหมดอยู่ที่เดียว — ห้าม hardcode กระจายที่อื่น
// ค่าที่ยังไม่รู้ ใส่ TBD ไว้ แก้ที่นี่ทีเดียว

export const EVENT = {
  name: 'ราตรีบัณฑิต 2569',
  theme: 'BACK TO SCHOOL',
  dateText: '19 ธันวาคม 2569',
  dateDay: '19',
  dateMonth: 'ธันวาคม',
  dateYear: '2569',
  timeText: '19.00 - 22.00 น.', // เวลางาน (ใช้บนตั๋ว/การ์ด)
  timeRegister: 'ลงทะเบียนหน้างาน 17.30 - 19.00 น.',
  timeEvent: 'เริ่มงาน 19.00 - 22.00 น.',

  venue: 'ลานจอดรถ สาขาวิชาชีววิทยา คณะวิทยาศาสตร์ มหาวิทยาลัยขอนแก่น',
  venueShort: 'ลานจอดรถ สาขาวิชาชีววิทยา มข.',
  venueNote: 'ผู้เข้าร่วมงานสามารถจอดรถได้ในบริเวณงาน',

  dressCode: 'ชีวิตมัธยม',

  // ธีมงานฉบับเต็ม (แสดงบนหน้าแรก) — ข้อความทางการจากผู้จัด
  themeDesc:
    'Back To School หมายถึง การกลับไปยังชีวิตวัยมัธยม ผู้จัดงานมีความประสงค์ที่จะพาผู้เข้าร่วมงาน ย้อนวันวานกลับไปยังวัยมัธยม เพื่อหวนรำลึกความหลัง ที่ถือเป็นช่วงวัยที่มนุษย์ทุกคนล้วนโหยหาที่สุด',
  dressCodeFull:
    'การแต่งกาย ผู้เข้าร่วมงานสามารถแต่งกายได้ตามที่ตัวเองต้องการ ภายใต้คำว่า "ชีวิตมัธยม" ไม่ว่าจะในมิติไหนก็ตาม อาทิ ความฝันในวัยมัธยม (อาชีพต่าง ๆ), ชุดในชีวิตมัธยม (ชุดนักเรียน / ชุดพละ / ชุดยุวกาชาด / ชุดลูกเสือ / ชุดเนตรนารี / ชุด นศท. เป็นต้น), ชุดในกิจกรรมวันต่าง ๆ (วันสุนทรภู่ / วันวิทยาศาสตร์ / วันไหว้ครู เป็นต้น)',

  organizer: 'Bio KKU · สาขาวิชาชีววิทยา คณะวิทยาศาสตร์ มหาวิทยาลัยขอนแก่น',
  facebook: { label: 'BIOLOGY KKU', url: 'https://www.facebook.com/' },
  instagram: { label: 'monkeyatbioinkku', url: 'https://instagram.com/monkeyatbioinkku' },

  // วันเวลาเริ่มงาน (ปี ค.ศ. = 2569 - 543 = 2026) ใช้สำหรับ countdown
  // 19 ธ.ค. 2026 19:00 เวลาไทย (UTC+7)
  startISO: '2026-12-19T19:00:00+07:00',

  // วันปิดรับลงทะเบียน — 18 ธ.ค. 2569 (2026) สิ้นวัน ฟอร์มจะปิดอัตโนมัติ
  registrationDeadlineISO: '2026-12-18T23:59:59+07:00' as string | null,
  deadlineText: '18 ธันวาคม 2569',

  ticketPrefix: 'BIO69',
} as const

// งานนี้เฉพาะสาขาวิชาชีววิทยา
export const MAJORS = ['ชีววิทยา'] as const
export const DEFAULT_MAJOR = 'ชีววิทยา'
export const DEFAULT_FACULTY = 'คณะวิทยาศาสตร์'

export const FOOD_TYPES = ['ทั่วไป', 'มังสวิรัติ', 'เจ', 'ฮาลาล'] as const
export type FoodType = (typeof FOOD_TYPES)[number]

// ตัวเลือก "ชั้นปี / สถานะ" (ค่าที่เก็บ = ข้อความที่แสดงเลย)
export const YEAR_LEVELS = ['ปี 1', 'ปี 2', 'ปี 3', 'ปี 4', 'พี่บัณฑิต', 'พี่ ป.โท', 'พี่ ป.เอก', 'อาจารย์'] as const

export const API_URL = import.meta.env.VITE_API_URL

export function isRegistrationClosed(): boolean {
  if (!EVENT.registrationDeadlineISO) return false
  return Date.now() > new Date(EVENT.registrationDeadlineISO).getTime()
}
