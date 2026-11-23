import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown } from 'lucide-react'
import { SerializedProduct } from '@/types'
import { CATEGORIES } from '@/lib/constants'
import { waLink } from '@/lib/whatsapp'
import { WhatsAppIcon } from './icons'

interface Props {
  featured: SerializedProduct[]
  totalProducts: number
  totalCategories: number
}

const TILE_BG = ['bg-cream-200', 'bg-lime-soft', 'bg-sand']

export default function Hero({ featured, totalProducts, totalCategories }: Props) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:pb-24 lg:pt-16">
        <div className="animate-fade-up lg:col-span-6 lg:pt-8">
          <h1 className="font-display text-[2.75rem] font-medium leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-[4.5rem]">
            Comida real
            <br />
            para tu <em className="font-normal italic text-forest">día a día</em>.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg">
            Snacks, frutos secos, lácteos, harinas y mucho más. Elige lo que te gusta y
            haz tu pedido directo por WhatsApp.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#catalogo"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-cream-100 transition-colors hover:bg-forest"
            >
              Ver catálogo
              <ArrowDown className="h-4 w-4" />
            </Link>
            <a
              href={waLink('¡Hola! Quiero hacer un pedido.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-ink/15 bg-cream-100 px-6 text-sm font-semibold text-ink transition-colors hover:border-ink/40"
            >
              <WhatsAppIcon className="h-4 w-4 text-forest" />
              Escríbenos
            </a>
          </div>

          <dl className="mt-12 grid max-w-xs grid-cols-2 gap-6 border-t border-ink/10 pt-6">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Productos</dt>
              <dd className="mt-1 font-display text-3xl text-ink">{totalProducts}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Categorías</dt>
              <dd className="mt-1 font-display text-3xl text-ink">{totalCategories}</dd>
            </div>
          </dl>
        </div>

        {featured.length > 0 && (
          <div className="animate-fade-up [animation-delay:150ms] lg:col-span-6">
            <div className="grid h-[380px] grid-cols-2 grid-rows-2 gap-3 sm:h-[480px] sm:gap-4 lg:h-[560px]">
              {featured.slice(0, 3).map((p, i) => {
                const cat = CATEGORIES[p.category] ?? CATEGORIES.all
                return (
                  <Link
                    key={p.id}
                    href={`/productos/${p.id}`}
                    className={`group relative overflow-hidden rounded-[28px] ${TILE_BG[i]} ${i === 0 ? 'row-span-2' : ''}`}
                  >
                    <Image
                      src={p.imageUrl!}
                      alt={p.name}
                      fill
                      priority={i === 0}
                      sizes="(max-width: 1024px) 50vw, 30vw"
                      className={`object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.05] ${i === 0 ? 'p-6 sm:p-10' : 'p-5 sm:p-7'}`}
                    />
                    <span className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 rounded-full bg-cream-100/90 px-3 py-2 text-xs backdrop-blur-sm sm:bottom-4 sm:left-4 sm:right-auto">
                      <span className="truncate font-semibold text-ink">{p.name}</span>
                      <span className="hidden text-ink-muted sm:inline">· {cat.name}</span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
