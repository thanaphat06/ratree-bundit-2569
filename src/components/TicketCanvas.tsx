import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { renderTicket, type TicketData } from '../lib/ticket'

export interface TicketCanvasHandle {
  getCanvas: () => HTMLCanvasElement | null
}

// วาดตั๋วลง canvas แล้วแสดงผลแบบย่อ (CSS) — ใช้ canvas เดียวกันตอนดาวน์โหลด
const TicketCanvas = forwardRef<TicketCanvasHandle, { data: TicketData; className?: string }>(
  ({ data, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [loading, setLoading] = useState(true)

    useImperativeHandle(ref, () => ({ getCanvas: () => canvasRef.current }))

    useEffect(() => {
      let alive = true
      setLoading(true)
      const run = async () => {
        if (!canvasRef.current) return
        await renderTicket(canvasRef.current, data)
        if (alive) setLoading(false)
      }
      run()
      return () => {
        alive = false
      }
      // วาดใหม่เมื่อข้อมูลเปลี่ยน
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(data)])

    return (
      <div className={`relative mx-auto w-full max-w-[320px] ${className || ''}`}>
        <canvas
          ref={canvasRef}
          className="block h-auto w-full rounded-2xl shadow-warm ring-1 ring-stone/20"
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-cream/70 text-sm text-ink/60">
            กำลังสร้างตั๋ว…
          </div>
        )}
      </div>
    )
  },
)
TicketCanvas.displayName = 'TicketCanvas'
export default TicketCanvas
