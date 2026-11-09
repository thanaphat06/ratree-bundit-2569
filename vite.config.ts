import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: ตั้ง VITE_BASE = '/<repo-name>/' ตอน build (ดู README)
// Vercel / โดเมนราก: ปล่อยว่าง = '/'
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
})
