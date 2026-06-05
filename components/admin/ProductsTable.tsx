'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { SerializedProduct } from '@/types'
import { CATEGORIES } from '@/lib/constants'
import { fmt } from '@/lib/utils'

interface Props {
  products: SerializedProduct[]
}

export default function ProductsTable({ products }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

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

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-2">📦</p>
        <p className="font-medium">No hay productos aún</p>
        <Link href="/admin/productos/nuevo" className="mt-3 inline-block text-sm text-brand-600 underline">
          Crear el primero
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500 text-xs uppercase tracking-wide">
            <th className="pb-3 pr-4 w-12"></th>
            <th className="pb-3 pr-4">Producto</th>
            <th className="pb-3 pr-4 hidden md:table-cell">Categoría</th>
            <th className="pb-3 pr-4 hidden sm:table-cell">Precio</th>
            <th className="pb-3 pr-4 hidden lg:table-cell">Estado</th>
            <th className="pb-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map(p => {
            const cat = CATEGORIES[p.category] ?? CATEGORIES.all
            const minPrice = p.variants.length ? Math.min(...p.variants.map(v => v.price)) : null
            return (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 pr-4">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                    {p.imageUrl ? (
                      <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="40px" />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-xl"
                        style={{ background: cat.light }}
                      >
                        {p.emoji}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <p className="font-medium text-gray-900 line-clamp-1">{p.name}</p>
                  <p className="text-gray-400 text-xs line-clamp-1 mt-0.5">{p.description}</p>
                </td>
                <td className="py-3 pr-4 hidden md:table-cell">
                  <span
                    className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: cat.light, color: cat.color }}
                  >
                    {cat.emoji} {cat.name}
                  </span>
                </td>
                <td className="py-3 pr-4 hidden sm:table-cell">
                  <span className="font-semibold text-brand-700">
                    {minPrice ? fmt(minPrice) : '—'}
                  </span>
                </td>
                <td className="py-3 pr-4 hidden lg:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {p.active ? 'Activo' : 'Oculto'}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/productos/${p.id}`}
                      className="text-xs bg-brand-50 text-brand-700 hover:bg-brand-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
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
  )
}
