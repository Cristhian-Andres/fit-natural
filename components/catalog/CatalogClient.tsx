'use client'

import { useState, useMemo, useCallback } from 'react'
import { SerializedProduct } from '@/types'
import { PRICE_FILTERS } from '@/lib/constants'
import Sidebar from './Sidebar'
import ProductCard from './ProductCard'

interface Props {
  products: SerializedProduct[]
}

export default function CatalogClient({ products }: Props) {
  const [category, setCategory] = useState('all')
  const [price, setPrice] = useState('all')
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Count products per category (before price/search filter, for display)
  const counts = useMemo(() => {
    const c: Record<string, number> = { __total: products.length }
    for (const p of products) {
      c[p.category] = (c[p.category] ?? 0) + 1
    }
    return c
  }, [products])

  const filtered = useMemo(() => {
    const pf = PRICE_FILTERS.find(f => f.id === price)
    const q = search.toLowerCase().trim()
    return products.filter(p => {
      if (category !== 'all' && p.category !== category) return false
      if (pf && pf.id !== 'all') {
        const minPrice = Math.min(...p.variants.map(v => v.price))
        if (minPrice < pf.min || minPrice > pf.max) return false
      }
      if (q) {
        const haystack = [p.name, p.description, p.category, ...p.flavors].join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [products, category, price, search])

  const reset = useCallback(() => {
    setCategory('all')
    setPrice('all')
    setSearch('')
  }, [])

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-6 flex-1">
      {/* Mobile filter toggle */}
      <div className="flex items-center justify-between mb-4 lg:hidden">
        <p className="text-sm text-gray-500">{filtered.length} productos</p>
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 border border-gray-200 bg-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm"
        >
          <span>⚙️</span> Filtros
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar desktop */}
        <div className="hidden lg:block w-56 flex-shrink-0">
          <Sidebar
            selectedCategory={category}
            selectedPrice={price}
            search={search}
            counts={counts}
            onCategory={setCategory}
            onPrice={setPrice}
            onSearch={setSearch}
            onReset={reset}
          />
        </div>

        {/* Grid */}
        <main className="flex-1 min-w-0">
          <p className="hidden lg:block text-sm text-gray-500 mb-4">
            {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-2">🔍</p>
              <p className="font-medium">Sin resultados</p>
              <button onClick={reset} className="mt-3 text-sm text-brand-600 underline">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white z-50 shadow-xl overflow-y-auto p-5 lg:hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Filtros</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            <Sidebar
              selectedCategory={category}
              selectedPrice={price}
              search={search}
              counts={counts}
              onCategory={cat => { setCategory(cat); setSidebarOpen(false) }}
              onPrice={p => { setPrice(p); setSidebarOpen(false) }}
              onSearch={setSearch}
              onReset={() => { reset(); setSidebarOpen(false) }}
            />
          </div>
        </>
      )}
    </div>
  )
}
