'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const NAV = [
  { href: '/admin/productos', label: 'Productos', icon: '📦' },
]

export default function AdminNav() {
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
    <nav className="bg-brand-800 text-white min-h-screen w-56 flex flex-col flex-shrink-0">
      <div className="p-5 border-b border-brand-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
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
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname.startsWith(item.href)
                  ? 'bg-brand-600 text-white font-semibold'
                  : 'text-brand-200 hover:bg-brand-700'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="p-3 border-t border-brand-700">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-brand-300 hover:bg-brand-700 transition-colors mb-1"
        >
          <span>🌐</span> Ver catálogo
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-brand-300 hover:bg-brand-700 transition-colors"
        >
          <span>🚪</span> Cerrar sesión
        </button>
      </div>
    </nav>
  )
}
