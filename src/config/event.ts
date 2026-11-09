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

  dressCode: 'ตามธีม "ชีวิตมัธยม"',

  // ธีมงานฉบับเต็ม (แสดงบนหน้าแรก)
  themeDesc:
    'Back To School คือการกลับไปยังชีวิตวัยมัธยม ผู้จัดงานอยากพาทุกคนย้อนวันวานกลับไปวัยมัธยม เพื่อหวนรำลึกความหลัง ช่วงวัยที่มนุษย์ทุกคนล้วนโหยหาที่สุด',
  dressCodeFull:
    'แต่งกายได้ตามใจคุณ ภายใต้คำว่า "ชีวิตมัธยม" ไม่ว่าจะมิติไหนก็ได้ เช่น ความฝันในวัยมัธยม (อาชีพต่าง ๆ), ชุดในชีวิตมัธยม (ชุดนักเรียน / ชุดพละ / ชุดยุวกาชาด / ชุดลูกเสือ / ชุดเนตรนารี / ชุด นศท.), หรือชุดในกิจกรรมวันต่าง ๆ (วันสุนทรภู่ / วันวิทยาศาสตร์ / วันไหว้ครู เป็นต้น)',

  organizer: 'Bio KKU · สาขาวิชาชีววิทยา คณะวิทยาศาสตร์ มหาวิทยาลัยขอนแก่น',
  facebook: { label: 'BIOLOGY KKU', url: 'https://www.facebook.com/' },
  instagram: { label: 'monkeyatbioinkku', url: 'https://instagram.com/monkeyatbioinkku' },

  // วันเวลาเริ่มงาน (ปี ค.ศ. = 2569 - 543 = 2026) ใช้สำหรับ countdown
  // 19 ธ.ค. 2026 19:00 เวลาไทย (UTC+7)
  startISO: '2026-12-19T19:00:00+07:00',

  // ⚠️ TODO ถามทีม: วันปิดรับลงทะเบียน (null = ไม่ปิดอัตโนมัติ)
  // ใส่ ISO เช่น '2026-12-15T23:59:59+07:00' แล้วฟอร์มจะปิดเอง
  registrationDeadlineISO: null as string | null,

  ticketPrefix: 'BIO69',
} as const

// งานนี้เฉพาะสาขาวิชาชีววิทยา
export const MAJORS = ['ชีววิทยา'] as const
export const DEFAULT_MAJOR = 'ชีววิทยา'
export const DEFAULT_FACULTY = 'คณะวิทยาศาสตร์'

export const FOOD_TYPES = ['ทั่วไป', 'มังสวิรัติ', 'เจ', 'ฮาลาล'] as const
export type FoodType = (typeof FOOD_TYPES)[number]

export const YEAR_LEVELS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const

export const API_URL = import.meta.env.VITE_API_URL

export function isRegistrationClosed(): boolean {
  if (!EVENT.registrationDeadlineISO) return false
  return Date.now() > new Date(EVENT.registrationDeadlineISO).getTime()
}
