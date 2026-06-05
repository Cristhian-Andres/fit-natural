'use client'

import { CATEGORIES, PRICE_FILTERS } from '@/lib/constants'

interface Props {
  selectedCategory: string
  selectedPrice: string
  search: string
  counts: Record<string, number>
  onCategory: (cat: string) => void
  onPrice: (price: string) => void
  onSearch: (q: string) => void
  onReset: () => void
}

export default function Sidebar({
  selectedCategory,
  selectedPrice,
  search,
  counts,
  onCategory,
  onPrice,
  onSearch,
  onReset,
}: Props) {
  const hasFilters = selectedCategory !== 'all' || selectedPrice !== 'all' || search !== ''

  return (
    <aside className="w-full flex flex-col gap-5">
      {/* Search */}
      <div>
        <input
          type="search"
          placeholder="Buscar productos..."
          value={search}
          onChange={e => onSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        />
      </div>

      {/* Reset */}
      {hasFilters && (
        <button
          onClick={onReset}
          className="text-sm text-brand-600 hover:text-brand-800 font-medium text-left"
        >
          ✕ Limpiar filtros
        </button>
      )}

      {/* Categories */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Categorías</h3>
        <ul className="space-y-0.5">
          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const count = key === 'all' ? counts.__total ?? 0 : counts[key] ?? 0
            const active = selectedCategory === key
            return (
              <li key={key}>
                <button
                  onClick={() => onCategory(key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                    active
                      ? 'bg-brand-600 text-white font-semibold'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </span>
                  <span className={`text-xs ${active ? 'text-brand-200' : 'text-gray-400'}`}>
                    {count}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Precio</h3>
        <ul className="space-y-0.5">
          {PRICE_FILTERS.map(pf => {
            const active = selectedPrice === pf.id
            return (
              <li key={pf.id}>
                <button
                  onClick={() => onPrice(pf.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                    active
                      ? 'bg-brand-600 text-white font-semibold'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span>{pf.ico}</span>
                  <span>{pf.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
