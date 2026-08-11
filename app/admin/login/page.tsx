'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('Correo o contraseña incorrectos')
      setLoading(false)
    } else {
      toast.success('Bienvenido')
      router.push('/admin/productos')
      router.refresh()
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-brand-700 to-brand-900 flex items-center justify-center px-4 py-10">
      {/* Decorative glow blobs */}
      <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 rounded-full bg-brand-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-brand-300/20 blur-3xl" />

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block w-20 h-20 rounded-full overflow-hidden ring-4 ring-white/30 shadow-xl shadow-black/20 mb-4 bg-[#8bc34a]">
            <Image src="/logo-fit-natural.jpeg" alt="Fit Natural" width={80} height={80} className="w-full h-full object-cover scale-[1.4]" priority />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Fit Natural</h1>
          <p className="text-brand-200 text-sm mt-1">Panel de administración</p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl shadow-black/30 ring-1 ring-black/5 p-6 sm:p-7">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                inputMode="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base sm:text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                placeholder="admin@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-base sm:text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="text-center text-brand-300 text-xs mt-6 pb-[env(safe-area-inset-bottom)]">
          By @ Cristhian Luna
        </p>
      </div>
    </div>
  )
}
