// ครอป + ย่อรูปโปรไฟล์เป็นสี่เหลี่ยมจัตุรัส 512x512 JPEG q0.85 ก่อนส่ง backend
import type { Area } from 'react-easy-crop'

const OUT_SIZE = 512
const QUALITY = 0.85

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.crossOrigin = 'anonymous'
    img.src = src
  })
}

// รับ data URL ของรูปต้นฉบับ + พื้นที่ครอป → คืน data URL JPEG 512x512
export async function cropToSquareDataUrl(src: string, area: Area): Promise<string> {
  const img = await loadImage(src)
  const canvas = document.createElement('canvas')
  canvas.width = OUT_SIZE
  canvas.height = OUT_SIZE
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(
    img,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    OUT_SIZE,
    OUT_SIZE,
  )
  return canvas.toDataURL('image/jpeg', QUALITY)
}

// อ่านไฟล์ที่เลือกเป็น data URL (ใช้เป็นต้นฉบับให้ตัวครอป)
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
