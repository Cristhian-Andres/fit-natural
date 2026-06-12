'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/productos', label: 'Productos', icon: '📦', exact: false },
]

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    toast.success('Sesión cerrada')
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-brand-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/20 bg-[#8bc34a]">
            <Image src="/logo-fit-natural.jpeg" alt="Fit Natural" width={40} height={40} className="w-full h-full object-cover scale-[1.4]" />
          </div>
          <div>
            <p className="font-bold text-sm">Fit Natural</p>
            <p className="text-brand-300 text-xs">Admin</p>
          </div>
        </div>
      </div>

      <ul className="flex-1 p-3 space-y-1">
        {NAV.map(item => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm transition-colors ${
                (item.exact ? pathname === item.href : pathname.startsWith(item.href))
                  ? 'bg-brand-600 text-white font-semibold'
                  : 'text-brand-200 hover:bg-brand-700'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="p-3 border-t border-brand-700 space-y-1">
        <Link
          href="/"
          target="_blank"
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm text-brand-300 hover:bg-brand-700 transition-colors"
        >
          <span className="text-lg">🌐</span> Ver catálogo
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-3 rounded-xl text-sm text-brand-300 hover:bg-brand-700 transition-colors"
        >
          <span className="text-lg">🚪</span> Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default function AdminNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <nav className="hidden md:flex flex-col w-56 flex-shrink-0 bg-brand-800 text-white min-h-screen">
        <NavContent />
      </nav>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-brand-800 text-white h-14 flex items-center justify-between px-4 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/20 bg-[#8bc34a]">
            <Image src="/logo-fit-natural.jpeg" alt="Fit Natural" width={32} height={32} className="w-full h-full object-cover scale-[1.4]" />
          </div>
          <span className="font-bold text-sm">Fit Natural Admin</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-brand-700 transition-colors"
          aria-label="Abrir menú"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-50"
            onClick={() => setOpen(false)}
          />
          <nav className="md:hidden fixed top-0 left-0 h-full w-64 bg-brand-800 text-white z-50 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-brand-700">
              <span className="font-bold text-sm text-white">Menú</span>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-brand-700 transition-colors text-brand-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <NavContent onClose={() => setOpen(false)} />
          </nav>
        </>
      )}
    </>
  )
}
