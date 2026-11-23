'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react'
import { SerializedProduct } from '@/types'
import { CATEGORIES, PRICE_FILTERS } from '@/lib/constants'
import ProductCard from './ProductCard'

interface Props {
  products: SerializedProduct[]
}

const SORTS = [
  { id: 'relevance', label: 'Destacados' },
  { id: 'price-asc', label: 'Precio: menor a mayor' },
  { id: 'price-desc', label: 'Precio: mayor a menor' },
  { id: 'name', label: 'Nombre A–Z' },
] as const
type SortId = (typeof SORTS)[number]['id']

const minPriceOf = (p: SerializedProduct) =>
  p.variants.length ? Math.min(...p.variants.map(v => v.price)) : 0

function validCategory(value: string | null) {
  return value && CATEGORIES[value] ? value : 'all'
}

export default function CatalogClient({ products }: Props) {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  const [category, setCategory] = useState(() => validCategory(categoryParam))
  const [price, setPrice] = useState('all')
  const [sort, setSort] = useState<SortId>('relevance')
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)

  // Los enlaces del footer (/?category=x) cambian el parametro sin remontar:
  // se ajusta el estado durante el render en lugar de en un efecto.
  const [prevParam, setPrevParam] = useState(categoryParam)
  if (categoryParam !== prevParam) {
    setPrevParam(categoryParam)
    setCategory(validCategory(categoryParam))
  }

  // Mantiene la URL compartible sin provocar navegacion.
  const selectCategory = useCallback((key: string) => {
    setCategory(key)
    const url = new URL(window.location.href)
    if (key === 'all') url.searchParams.delete('category')
    else url.searchParams.set('category', key)
    window.history.replaceState(null, '', url)
  }, [])

  useEffect(() => {
    document.body.style.overflow = sheetOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sheetOpen])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: products.length }
    for (const p of products) c[p.category] = (c[p.category] ?? 0) + 1
    return c
  }, [products])

  const categories = useMemo(
    () => Object.entries(CATEGORIES).filter(([key]) => (counts[key] ?? 0) > 0),
    [counts],
  )

  const filtered = useMemo(() => {
    const pf = PRICE_FILTERS.find(f => f.id === price)
    const q = search.toLowerCase().trim()
    const list = products.filter(p => {
      if (category !== 'all' && p.category !== category) return false
      if (pf && pf.id !== 'all') {
        const min = minPriceOf(p)
        if (min < pf.min || min > pf.max) return false
      }
      if (q) {
        const haystack = [p.name, p.description, CATEGORIES[p.category]?.name ?? '', ...p.flavors]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
    if (sort === 'price-asc') list.sort((a, b) => minPriceOf(a) - minPriceOf(b))
    if (sort === 'price-desc') list.sort((a, b) => minPriceOf(b) - minPriceOf(a))
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'es'))
    return list
  }, [products, category, price, search, sort])

  const reset = useCallback(() => {
    selectCategory('all')
    setPrice('all')
    setSearch('')
    setSort('relevance')
  }, [selectCategory])

  const extraFilters = (price !== 'all' ? 1 : 0) + (sort !== 'relevance' ? 1 : 0)
  const title = category === 'all' ? 'Todos los productos' : CATEGORIES[category].name

  return (
    <section id="catalogo" className="scroll-mt-16">
      <div className="mx-auto flex max-w-7xl items-end justify-between gap-4 px-4 pb-5 sm:px-6 lg:px-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-forest">Catálogo</p>
          <h2 className="mt-1 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            {title}
          </h2>
        </div>
        <p className="shrink-0 pb-1 text-sm text-ink-muted">
          {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Barra de filtros fija */}
      <div className="sticky top-16 z-30 border-y border-ink/10 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-6 lg:px-8">
          <div className="flex gap-2 lg:order-2 lg:ml-auto lg:shrink-0">
            <label className="relative flex-1 lg:w-60 lg:flex-none">
              <span className="sr-only">Buscar productos</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input
                type="search"
                placeholder="Buscar productos"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-10 w-full rounded-full border border-ink/10 bg-cream-100 pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted outline-none transition focus:border-forest/40 focus:ring-2 focus:ring-forest/15"
              />
            </label>

            {/* Escritorio: selects */}
            <SelectPill
              label="Precio"
              value={price}
              onChange={setPrice}
              options={PRICE_FILTERS.map(p => ({ id: p.id, label: p.id === 'all' ? 'Cualquier precio' : p.label }))}
            />
            <SelectPill
              label="Ordenar"
              value={sort}
              onChange={v => setSort(v as SortId)}
              options={SORTS.map(s => ({ id: s.id, label: s.label }))}
            />

            {/* Movil: abre panel */}
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="relative inline-flex h-10 items-center gap-2 rounded-full border border-ink/10 bg-cream-100 px-4 text-sm font-semibold text-ink lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {extraFilters > 0 && (
                <span className="grid h-5 w-5 place-items-center rounded-full bg-forest text-[11px] text-cream-100">
                  {extraFilters}
                </span>
              )}
            </button>
          </div>

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-hide sm:-mx-6 sm:px-6 lg:order-1 lg:mx-0 lg:min-w-0 lg:flex-1 lg:px-0 lg:pr-8 lg:[mask-image:linear-gradient(to_right,black_88%,transparent)]">
            {categories.map(([key, cat]) => {
              const active = category === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectCategory(key)}
                  aria-pressed={active}
                  className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-ink text-cream-100'
                      : 'border border-ink/10 bg-cream-100 text-ink-soft hover:border-ink/30 hover:text-ink'
                  }`}
                >
                  {cat.name}
                  <span className={`text-xs ${active ? 'text-cream-100/60' : 'text-ink-muted'}`}>
                    {counts[key]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="mx-auto max-w-sm py-24 text-center">
            <Search className="mx-auto h-8 w-8 text-ink-muted" strokeWidth={1.5} />
            <p className="mt-4 font-display text-2xl text-ink">Sin resultados</p>
            <p className="mt-2 text-sm text-ink-muted">
              No encontramos productos con esos filtros. Prueba con otra búsqueda.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-semibold text-cream-100 hover:bg-forest"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 xl:grid-cols-4">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      {/* Panel de filtros (movil) */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
          <div className="absolute inset-0 animate-fade-in bg-ink/40" onClick={() => setSheetOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] animate-sheet-up overflow-y-auto rounded-t-[28px] bg-cream-100 px-5 pb-6 pt-3">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15" />
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-2xl text-ink">Filtros</h3>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Cerrar"
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <SheetGroup
              title="Precio"
              value={price}
              onChange={setPrice}
              options={PRICE_FILTERS.map(p => ({ id: p.id, label: p.id === 'all' ? 'Cualquier precio' : p.label }))}
            />
            <SheetGroup
              title="Ordenar por"
              value={sort}
              onChange={v => setSort(v as SortId)}
              options={SORTS.map(s => ({ id: s.id, label: s.label }))}
            />

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => { setPrice('all'); setSort('relevance') }}
                className="h-12 flex-1 rounded-full border border-ink/15 text-sm font-semibold text-ink"
              >
                Restablecer
              </button>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="h-12 flex-[2] rounded-full bg-ink text-sm font-semibold text-cream-100"
              >
                Ver {filtered.length} productos
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

interface Option { id: string; label: string }

function SelectPill({ label, value, onChange, options }: {
  label: string
  value: string
  onChange: (v: string) => void
  options: Option[]
}) {
  return (
    <label className="relative hidden lg:block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-10 cursor-pointer appearance-none rounded-full border border-ink/10 bg-cream-100 pl-4 pr-9 text-sm font-medium text-ink outline-none transition hover:border-ink/30 focus:border-forest/40 focus:ring-2 focus:ring-forest/15"
      >
        {options.map(o => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
    </label>
  )
}

function SheetGroup({ title, value, onChange, options }: {
  title: string
  value: string
  onChange: (v: string) => void
  options: Option[]
}) {
  return (
    <fieldset className="border-t border-ink/10 py-4">
      <legend className="sr-only">{title}</legend>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">{title}</p>
      <div className="flex flex-col">
        {options.map(o => {
          const active = o.id === value
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className="flex items-center justify-between py-2.5 text-left text-[15px] text-ink"
            >
              <span className={active ? 'font-semibold' : ''}>{o.label}</span>
              {active && <Check className="h-4 w-4 text-forest" />}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
