'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

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
    <div className="min-h-screen bg-gradient-to-b from-brand-700 to-brand-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block w-20 h-20 rounded-full overflow-hidden ring-4 ring-white/30 shadow-xl mb-4 bg-[#8bc34a]">
            <Image src="/logo-fit-natural.jpeg" alt="Fit Natural" width={80} height={80} className="w-full h-full object-cover scale-[1.4]" priority />
          </div>
          <h1 className="text-2xl font-bold text-white">Fit Natural</h1>
          <p className="text-brand-300 text-sm mt-1">Panel de administración</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
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
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
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
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm mt-2"
            >
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="text-center text-brand-400 text-xs mt-6">
          By @ Cristhian Luna
        </p>
      </div>
    </div>
  )
}
