// วาดตั๋วด้วย Canvas → PNG 1080x1920 (สไตล์บัตรนักเรียน Back to School)
// องค์ประกอบตกแต่งวาดด้วย vector เองทั้งหมด (ไม่ใช้รูปลิขสิทธิ์ภายนอก)
import QRCode from 'qrcode'
import { EVENT } from '../config/event'

export interface TicketData {
  ticket_id: string
  nickname: string
  first_name: string
  last_name: string
  major: string
  student_id: string
  bio?: string
  // data URL รูปโปรไฟล์ (base64) หรือ null
  profileImage?: string | null
  showPhoto: boolean
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

// ตัดข้อความไทย/อังกฤษให้พอดีความกว้าง
function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number, startPx: number, minPx: number, weightFont: string) {
  let px = startPx
  while (px > minPx) {
    ctx.font = `${weightFont} ${px}px ${THAI}`
    if (ctx.measureText(text).width <= maxW) break
    px -= 4
  }
  return px
}

const POSTER_URL = import.meta.env.BASE_URL + 'theme-poster.png'

// วาดตั๋วลงใน canvas ที่ส่งมา (ใช้ทั้ง preview และ export)
// ส่วนบน = โปสเตอร์ธีมจริง, ส่วนล่าง = การ์ดข้อมูลผู้ลงทะเบียน + QR เช็คอิน
export async function renderTicket(canvas: HTMLCanvasElement, data: TicketData) {
  await ensureFonts()
  const scale = 2
  const cx = W / 2

  // โหลดโปสเตอร์เป็นส่วนหัว (ถ้าโหลดไม่ได้ ใช้แถบส้มแทน)
  let poster: HTMLImageElement | null = null
  try {
    poster = await loadImage(POSTER_URL)
  } catch {
    poster = null
  }
  const posterH = poster ? Math.round(W * (poster.height / poster.width)) : 720

  const CARD_H = 1140
  const H = posterH + CARD_H

  canvas.width = W * scale
  canvas.height = H * scale
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)
  ctx.textBaseline = 'alphabetic'

  // ---- พื้นการ์ดครีม + เส้นตารางสมุด (ทั้งใบ) ----
  ctx.fillStyle = C.cream
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = 'rgba(138,110,82,0.10)'
  ctx.lineWidth = 1
  for (let gy = posterH; gy <= H; gy += 46) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke()
  }
  for (let gx = 0; gx <= W; gx += 46) {
    ctx.beginPath(); ctx.moveTo(gx, posterH); ctx.lineTo(gx, H); ctx.stroke()
  }

  // ---- ส่วนหัว: โปสเตอร์ ----
  if (poster) {
    ctx.drawImage(poster, 0, 0, W, posterH)
  } else {
    ctx.fillStyle = C.orange
    ctx.fillRect(0, 0, W, posterH)
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.font = `700 120px ${DISPLAY}`
    ctx.fillText('BACK TO SCHOOL', cx, posterH / 2)
  }

  // ---- รอยปรุ (perforation) ที่รอยต่อ ----
  const perfY = posterH
  ctx.fillStyle = C.cream
  ctx.beginPath(); ctx.arc(0, perfY, 30, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(W, perfY, 30, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = 'rgba(138,110,82,0.45)'
  ctx.lineWidth = 3
  ctx.setLineDash([16, 16])
  ctx.beginPath(); ctx.moveTo(40, perfY); ctx.lineTo(W - 40, perfY); ctx.stroke()
  ctx.setLineDash([])

  // ---- รูปโปรไฟล์วงกลม ----
  const cy = posterH + 180
  const rad = 140
  ctx.save()
  const ring = ctx.createLinearGradient(cx - rad, cy - rad, cx + rad, cy + rad)
  ring.addColorStop(0, C.gold)
  ring.addColorStop(1, C.orange)
  ctx.fillStyle = ring
  ctx.beginPath(); ctx.arc(cx, cy, rad + 12, 0, Math.PI * 2); ctx.fill()

  const hasPhoto = data.showPhoto && !!data.profileImage
  if (hasPhoto) {
    try {
      const img = await loadImage(data.profileImage!)
      ctx.save()
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.clip()
      const ar = img.width / img.height
      let dw = rad * 2, dh = rad * 2
      if (ar > 1) dw = dh * ar
      else dh = dw / ar
      ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh)
      ctx.restore()
    } catch {
      drawInitial(ctx, cx, cy, rad, data.nickname)
    }
  } else {
    drawInitial(ctx, cx, cy, rad, data.nickname)
  }
  ctx.restore()

  // ---- ชื่อเล่น + ชื่อ + สาขา/รหัส ----
  ctx.textAlign = 'center'
  ctx.fillStyle = C.ink
  const nickPx = fitText(ctx, data.nickname, W - 200, 92, 48, '700')
  ctx.font = `700 ${nickPx}px ${THAI}`
  ctx.fillText(data.nickname, cx, posterH + 400)

  ctx.fillStyle = 'rgba(31,26,23,0.85)'
  const fullName = `${data.first_name} ${data.last_name}`
  const namePx = fitText(ctx, fullName, W - 220, 46, 30, '500')
  ctx.font = `500 ${namePx}px ${THAI}`
  ctx.fillText(fullName, cx, posterH + 458)

  ctx.fillStyle = C.orangeDeep
  ctx.font = `500 34px ${THAI}`
  ctx.fillText(`${data.major} · ${data.student_id}`, cx, posterH + 512)

  if (data.bio && data.bio.trim()) {
    ctx.fillStyle = 'rgba(31,26,23,0.6)'
    const bioPx = fitText(ctx, `“${data.bio}”`, W - 240, 34, 24, 'italic 400')
    ctx.font = `italic 400 ${bioPx}px ${THAI}`
    ctx.fillText(`“${data.bio}”`, cx, posterH + 560)
  }

  // ---- QR เช็คอิน ----
  const qrSize = 280
  const qrY = posterH + 644
  ctx.fillStyle = 'rgba(31,26,23,0.5)'
  ctx.font = `500 28px ${THAI}`
  ctx.fillText('สแกนเพื่อเช็คอินหน้างาน', cx, qrY - 18)
  try {
    const qrUrl = await QRCode.toDataURL(data.ticket_id, {
      margin: 1,
      width: qrSize * scale,
      color: { dark: '#1F1A17', light: '#FFFFFF' },
    })
    const qrImg = await loadImage(qrUrl)
    ctx.fillStyle = '#ffffff'
    roundRect(ctx, cx - qrSize / 2 - 16, qrY - 16, qrSize + 32, qrSize + 32, 20)
    ctx.fill()
    ctx.strokeStyle = 'rgba(138,110,82,0.3)'
    ctx.lineWidth = 2
    roundRect(ctx, cx - qrSize / 2 - 16, qrY - 16, qrSize + 32, qrSize + 32, 20)
    ctx.stroke()
    ctx.drawImage(qrImg, cx - qrSize / 2, qrY, qrSize, qrSize)
  } catch {
    /* QR fail — ข้าม */
  }

  ctx.fillStyle = C.ink
  ctx.font = `700 44px ${DISPLAY}`
  ctx.fillText(data.ticket_id, cx, qrY + qrSize + 58)

  // ---- Footer: FB / IG ----
  ctx.fillStyle = 'rgba(31,26,23,0.6)'
  ctx.font = `400 26px ${THAI}`
  ctx.fillText(`FB: ${EVENT.facebook.label}  ·  IG: ${EVENT.instagram.label}`, cx, H - 48)

  // ---- กรอบนอกตั๋ว ----
  ctx.strokeStyle = 'rgba(138,110,82,0.35)'
  ctx.lineWidth = 3
  roundRect(ctx, 6, 6, W - 12, H - 12, 36)
  ctx.stroke()
}

function drawInitial(ctx: CanvasRenderingContext2D, cx: number, cy: number, rad: number, nickname: string) {
  ctx.save()
  ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.clip()
  ctx.fillStyle = C.orange
  ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2)
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const initial = (nickname || '?').trim().charAt(0).toUpperCase()
  ctx.font = `700 150px ${DISPLAY}`
  ctx.fillText(initial, cx, cy + 8)
  ctx.restore()
  ctx.textBaseline = 'alphabetic'
}

// แปลง canvas เป็น PNG blob
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  })
}

// ดาวน์โหลด PNG — มี fallback สำหรับ iOS Safari ที่ดาวน์โหลดตรง ๆ ไม่ได้
export async function downloadTicket(canvas: HTMLCanvasElement, filename: string): Promise<'downloaded' | 'newtab'> {
  const blob = await canvasToBlob(canvas)
  const url = URL.createObjectURL(blob)
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  if (isIOS) {
    // iOS: เปิดรูปในแท็บใหม่ ให้ผู้ใช้กดค้างเพื่อบันทึก
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
