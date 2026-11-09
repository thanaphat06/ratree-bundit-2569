import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Landing from './pages/Landing'
import Register from './pages/Register'
import Ticket from './pages/Ticket'

const base = import.meta.env.BASE_URL.replace(/\/$/, '')

const router = createBrowserRouter(
  [
    { path: '/', element: <Landing /> },
    { path: '/register', element: <Register /> },
    { path: '/ticket', element: <Ticket /> },
    { path: '*', element: <Landing /> },
  ],
  { basename: base || '/' },
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
