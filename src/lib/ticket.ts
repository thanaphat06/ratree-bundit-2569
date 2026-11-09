// วาดตั๋วด้วย Canvas → PNG 1080x1920 (สไตล์บัตรนักเรียน Back to School)
// องค์ประกอบตกแต่งวาดด้วย vector เองทั้งหมด (ไม่ใช้รูปลิขสิทธิ์ภายนอก)
import QRCode from 'qrcode'

export interface TicketData {
  ticket_id: string
  first_name: string
  last_name: string
  nickname: string
  student_id: string
  year_level: string
}

const W = 1080
const C = {
  orange: '#E8501C',
  orangeDeep: '#C2410C',
  gold: '#E9A93A',
  cream: '#FBF6EC',
  stone: '#8A6E52',
  ink: '#1F1A17',
}

const DISPLAY = '"Fredoka", "Prompt", sans-serif'
const THAI = '"Prompt", "Kanit", sans-serif'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// รอฟอนต์ไทย+อังกฤษโหลดจริงก่อนวาด ไม่งั้นสระ/วรรณยุกต์ไทยเพี้ยน
async function ensureFonts() {
  try {
    await Promise.all([
      document.fonts.load('700 100px "Fredoka"'),
      document.fonts.load('600 100px "Prompt"'),
      document.fonts.load('400 100px "Prompt"'),
      document.fonts.load('italic 400 100px "Prompt"'),
    ])
    await document.fonts.ready
  } catch {
    /* ถ้า load() ไม่รองรับ ก็ข้ามไป ใช้ fallback */
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

const POSTER_URL = import.meta.env.BASE_URL + 'theme-poster.png'

// วาดตั๋วลงใน canvas ที่ส่งมา (ใช้ทั้ง preview และ export)
// ส่วนบน = โปสเตอร์ธีมจริง, ส่วนล่าง = การ์ดข้อมูลผู้ลงทะเบียน + QR เช็คอิน
// แถบ "E-Ticket E-Ticket ..." สีส้ม (บน/ล่างของตั๋ว)
function drawTicketStrip(ctx: CanvasRenderingContext2D, y: number, h: number) {
  ctx.fillStyle = C.orange
  ctx.fillRect(0, y, W, h)
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.font = `italic 600 24px ${DISPLAY}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  const label = 'E-Ticket'
  const gap = 46
  let x = 24
  while (x < W) {
    ctx.fillText(label, x, y + h / 2 + 1)
    x += ctx.measureText(label).width + gap
  }
  ctx.textBaseline = 'alphabetic'
}

export async function renderTicket(canvas: HTMLCanvasElement, data: TicketData) {
  await ensureFonts()
  const scale = 2

  // โหลดโปสเตอร์
  let poster: HTMLImageElement | null = null
  try {
    poster = await loadImage(POSTER_URL)
  } catch {
    poster = null
  }

  const stripH = 46
  const side = 44
  const posterW = W - side * 2
  const posterRatio = poster ? poster.height / poster.width : 1.414
  const posterH = Math.round(posterW * posterRatio)
  const posterY = stripH + 26
  const posterBottom = posterY + posterH

  const infoTop = posterBottom + 54
  const r1Lbl = infoTop + 34, r1Val = infoTop + 80
  const r2Lbl = infoTop + 150, r2Val = infoTop + 196
  const qrSize = 210
  const qrBottom = infoTop + qrSize
  const captionY = qrBottom + 30
  const blockBottom = Math.max(captionY, r2Val)
  const H = blockBottom + 36 + stripH

  canvas.width = W * scale
  canvas.height = H * scale
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)
  ctx.textBaseline = 'alphabetic'

  // พื้นขาว + กรอบนอก
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = 'rgba(138,110,82,0.25)'
  ctx.lineWidth = 2
  roundRect(ctx, 4, 4, W - 8, H - 8, 28)
  ctx.stroke()

  // แถบ E-Ticket บน/ล่าง
  drawTicketStrip(ctx, 0, stripH)
  drawTicketStrip(ctx, H - stripH, stripH)

  // โปสเตอร์ในกรอบมุมมน
  ctx.save()
  roundRect(ctx, side, posterY, posterW, posterH, 18)
  ctx.clip()
  if (poster) {
    ctx.drawImage(poster, side, posterY, posterW, posterH)
  } else {
    ctx.fillStyle = C.orange
    ctx.fillRect(side, posterY, posterW, posterH)
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.font = `700 110px ${DISPLAY}`
    ctx.fillText('BACK TO SCHOOL', W / 2, posterY + posterH / 2)
  }
  ctx.restore()
  ctx.strokeStyle = 'rgba(138,110,82,0.2)'
  ctx.lineWidth = 2
  roundRect(ctx, side, posterY, posterW, posterH, 18)
  ctx.stroke()

  // ---- QR เช็คอิน (ซ้ายล่าง) ----
  try {
    // QR = รหัสนักศึกษา (ผู้จัดงานสแกนเช็คอินเทียบกับ Sheet)
    const qrUrl = await QRCode.toDataURL(data.student_id, {
      margin: 0,
      width: qrSize * scale,
      color: { dark: '#1F1A17', light: '#FFFFFF' },
    })
    const qrImg = await loadImage(qrUrl)
    ctx.drawImage(qrImg, side, infoTop, qrSize, qrSize)
  } catch {
    /* QR fail — ข้าม */
  }
  ctx.fillStyle = 'rgba(31,26,23,0.45)'
  ctx.font = `400 24px ${THAI}`
  ctx.textAlign = 'center'
  ctx.fillText('ข้อมูลเพิ่มเติม', side + qrSize / 2, captionY)
  ctx.textAlign = 'left'

  // ---- ตาราง Name / Nickname / Student ID / Year Level ----
  const colX1 = side + qrSize + 60
  const colX2 = colX1 + 360
  const cellMax = 340

  function cell(label: string, value: string, x: number, lblY: number, valY: number) {
    ctx.textAlign = 'left'
    ctx.fillStyle = C.orange
    ctx.font = `600 27px ${DISPLAY}`
    ctx.fillText(label, x, lblY)
    ctx.fillStyle = C.ink
    ctx.textBaseline = 'alphabetic'
    let px = 40
    while (px > 24) {
      ctx.font = `600 ${px}px ${THAI}`
      if (ctx.measureText(value).width <= cellMax) break
      px -= 2
    }
    ctx.font = `600 ${px}px ${THAI}`
    ctx.fillText(value || '-', x, valY)
  }

  const fullName = `${data.first_name} ${data.last_name}`.trim()
  // รหัสนักศึกษา: โชว์เฉพาะที่เป็นตัวเลข (คนลงด้วยชื่อ → '-')
  const sidShown = /^[0-9][0-9-]{6,14}$/.test(data.student_id) ? data.student_id : '-'
  cell('Name.', fullName, colX1, r1Lbl, r1Val)
  cell('Nickname.', data.nickname, colX2, r1Lbl, r1Val)
  cell('Student ID.', sidShown, colX1, r2Lbl, r2Val)
  cell('Year Level.', data.year_level ? `${data.year_level}` : '-', colX2, r2Lbl, r2Val)
}

// แปลง canvas เป็น PNG blob
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  })
}

// บันทึกตั๋ว PNG — ไล่จากวิธีที่ดีสุดบนแต่ละอุปกรณ์
// 'shared' = ใช้ share sheet (iOS/Android กด "บันทึกรูปภาพ" ได้), 'downloaded' = โหลดไฟล์ตรง, 'newtab' = เปิดแท็บใหม่
export async function downloadTicket(canvas: HTMLCanvasElement, filename: string): Promise<'shared' | 'downloaded' | 'newtab'> {
  const blob = await canvasToBlob(canvas)
  const file = new File([blob], filename, { type: 'image/png' })

  // 1) Web Share API พร้อมไฟล์ — บนมือถือจะได้ share sheet ที่มี "บันทึกรูปภาพ"
  const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean }
  if (nav.canShare && nav.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename })
      return 'shared'
    } catch (e) {
      // ผู้ใช้กดยกเลิก share → ถือว่าเสร็จ ไม่ต้องเปิดแท็บใหม่
      if ((e as Error)?.name === 'AbortError') return 'shared'
      // อื่น ๆ → ตกไปใช้วิธีสำรอง
    }
  }

  // 2) เดสก์ท็อป: ดาวน์โหลดไฟล์ตรง ๆ
  const url = URL.createObjectURL(blob)
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  if (isIOS) {
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60000)
    return 'newtab'
  }
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
  return 'downloaded'
}

export function ticketFilename(d: TicketData) {
  const safe = (d.nickname || 'ticket').replace(/[^\p{L}\p{N}_-]/gu, '')
  return `ticket-${d.ticket_id}-${safe}.png`
}
