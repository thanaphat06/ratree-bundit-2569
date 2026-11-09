import { useCallback, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { cropToSquareDataUrl, fileToDataUrl } from '../lib/image'

// เลือกรูป → ครอปสี่เหลี่ยมจัตุรัส → คืน data URL 512x512 JPEG
export default function PhotoUploader({
  value,
  onChange,
}: {
  value: string | null
  onChange: (dataUrl: string | null) => void
}) {
  const [src, setSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setSrc(await fileToDataUrl(f))
    e.target.value = '' // ให้เลือกไฟล์เดิมซ้ำได้
  }

  const onCropComplete = useCallback((_: Area, px: Area) => setArea(px), [])

  const confirm = async () => {
    if (!src || !area) return
    setBusy(true)
    const out = await cropToSquareDataUrl(src, area)
    onChange(out)
    setSrc(null)
    setBusy(false)
  }

  // โหมดครอป
  if (src) {
    return (
      <div className="space-y-3">
        <div className="relative h-64 w-full overflow-hidden rounded-xl bg-ink/90">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full accent-orange"
          aria-label="ซูมรูป"
        />
        <div className="flex gap-2">
          <button type="button" className="btn-primary flex-1" onClick={confirm} disabled={busy}>
            {busy ? 'กำลังครอป…' : 'ใช้รูปนี้'}
          </button>
          <button type="button" className="btn-ghost" onClick={() => setSrc(null)}>
            ยกเลิก
          </button>
        </div>
      </div>
    )
  }

  // โหมดแสดง/เลือก
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-32 w-32 overflow-hidden rounded-full ring-4 ring-gold/60">
        {value ? (
          <img src={value} alt="รูปโปรไฟล์" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-cream text-ink/40">
            ยังไม่มีรูป
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <label className="btn-ghost cursor-pointer">
          {value ? 'เปลี่ยนรูป' : 'อัปโหลดรูป'}
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
        {value && (
          <button type="button" className="btn-ghost" onClick={() => onChange(null)}>
            ลบรูป
          </button>
        )}
      </div>
      <p className="text-center text-xs text-ink/50">ไม่ใส่รูปก็ได้ — ตั๋วจะใช้ตัวอักษรย่อชื่อเล่นแทน</p>
    </div>
  )
}
