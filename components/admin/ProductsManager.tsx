'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { SerializedProduct } from '@/types'
import { CATEGORIES, CATEGORY_OPTIONS } from '@/lib/constants'
import { fmt } from '@/lib/utils'

const PAGE_SIZE = 10

interface Props {
  products: SerializedProduct[]
}

export default function ProductsManager({ products: allProducts }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return allProducts.filter(p => {
      if (category !== 'all' && p.category !== category) return false
      if (status === 'active' && !p.active) return false
      if (status === 'inactive' && p.active) return false
      if (q && ![p.name, p.description, p.category].join(' ').toLowerCase().includes(q)) return false
      return true
    })
  }, [allProducts, search, category, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleFilter(fn: () => void) {
    fn()
    setPage(1)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Producto eliminado')
      router.refresh()
    } catch {
      toast.error('Error al eliminar el producto')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-4">

      {/* ── Filtros ── */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="search"
            placeholder="Buscar producto..."
            value={search}
            onChange={e => handleFilter(() => setSearch(e.target.value))}
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          />
        </div>
        <select
          value={category}
          onChange={e => handleFilter(() => setCategory(e.target.value))}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        >
          <option value="all">Todas las categorías</option>
          {CATEGORY_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={e => handleFilter(() => setStatus(e.target.value))}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        >
          <option value="all">Todos los estados</option>
          <option value="active">✅ Activos</option>
          <option value="inactive">⚫ Ocultos</option>
        </select>
      </div>

      {/* ── Conteo ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
          {(search || category !== 'all' || status !== 'all') && (
            <button
              onClick={() => handleFilter(() => { setSearch(''); setCategory('all'); setStatus('all') })}
              className="ml-2 text-brand-600 hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </p>
        <p className="text-xs text-gray-400">Página {page}/{totalPages}</p>
      </div>

      {/* ── Vista escritorio (tabla) ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500 text-xs uppercase tracking-wide">
              <th className="pb-3 pr-4 w-12"></th>
              <th className="pb-3 pr-4">Producto</th>
              <th className="pb-3 pr-4">Categoría</th>
              <th className="pb-3 pr-4">Precio</th>
              <th className="pb-3 pr-4">Estado</th>
              <th className="pb-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map(p => {
              const cat = CATEGORIES[p.category] ?? CATEGORIES.all
              const minPrice = p.variants.length ? Math.min(...p.variants.map(v => v.price)) : null
              return (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 relative flex-shrink-0">
                      {p.imageUrl ? (
                        <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="40px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl" style={{ background: cat.light }}>
                          {p.emoji}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-gray-900 line-clamp-1">{p.name}</p>
                    <p className="text-gray-400 text-xs line-clamp-1">{p.description}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: cat.light, color: cat.color }}>
                      {cat.emoji} {cat.name}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-semibold text-brand-700">
                    {minPrice ? fmt(minPrice) : '—'}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.active ? 'Activo' : 'Oculto'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/productos/${p.id}`} className="text-xs bg-brand-50 text-brand-700 hover:bg-brand-100 px-3 py-1.5 rounded-lg font-medium transition-colors">
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        disabled={deleting === p.id}
                        className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {deleting === p.id ? '...' : 'Eliminar'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Vista móvil (tarjetas) ── */}
      <div className="md:hidden space-y-3">
        {paginated.map(p => {
          const cat = CATEGORIES[p.category] ?? CATEGORIES.all
          const minPrice = p.variants.length ? Math.min(...p.variants.map(v => v.price)) : null
          return (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-3">
              {/* Imagen */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 relative flex-shrink-0">
                {p.imageUrl ? (
                  <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="64px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: cat.light }}>
                    {p.emoji}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-start justify-between gap-1">
                  <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{p.name}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.active ? '✓' : '—'}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full" style={{ background: cat.light, color: cat.color }}>
                    {cat.emoji} {cat.name}
                  </span>
                  {minPrice && (
                    <span className="text-brand-700 font-bold text-xs">{fmt(minPrice)}</span>
                  )}
                </div>

                {/* Botones acción */}
                <div className="flex gap-2 pt-1">
                  <Link
                    href={`/admin/productos/${p.id}`}
                    className="flex-1 text-center text-xs bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 rounded-xl font-semibold transition-colors"
                  >
                    ✏️ Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    disabled={deleting === p.id}
                    className="flex-1 text-center text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    {deleting === p.id ? '...' : '🗑 Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Estado vacío ── */}
      {paginated.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">📦</p>
          <p className="font-medium">Sin resultados</p>
        </div>
      )}

      {/* ── Paginación ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>

          {/* Números de página */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce<(number | '...')[]>((acc, n, i, arr) => {
                if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('...')
                acc.push(n)
                return acc
              }, [])
              .map((n, i) =>
                n === '...' ? (
                  <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n as number)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                      page === n
                        ? 'bg-brand-600 text-white'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    {n}
                  </button>
                )
              )}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}
