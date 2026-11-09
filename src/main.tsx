import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Landing from './pages/Landing'
import Register from './pages/Register'
import Ticket from './pages/Ticket'

// โหลดเฉพาะตอนเข้า /admin (html5-qrcode หนัก ไม่ให้ถ่วงหน้าหลัก)
const Admin = lazy(() => import('./pages/Admin'))

const base = import.meta.env.BASE_URL.replace(/\/$/, '')

const router = createBrowserRouter(
  [
    { path: '/', element: <Landing /> },
    { path: '/register', element: <Register /> },
    { path: '/ticket', element: <Ticket /> },
    {
      path: '/admin',
      element: (
        <Suspense fallback={<div className="min-h-screen paper-grid flex items-center justify-center text-ink/50">กำลังโหลด…</div>}>
          <Admin />
        </Suspense>
      ),
    },
    { path: '*', element: <Landing /> },
  ],
  { basename: base || '/' },
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
