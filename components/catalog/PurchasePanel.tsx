'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageCircle, PackageCheck } from 'lucide-react'
import { SerializedProduct } from '@/types'
import { CATEGORIES } from '@/lib/constants'
import { fmt } from '@/lib/utils'
import { productOrderLink } from '@/lib/whatsapp'
import { WhatsAppIcon } from './icons'

interface Props {
  product: SerializedProduct
}

export default function PurchasePanel({ product }: Props) {
  const cat = CATEGORIES[product.category] ?? CATEGORIES.all
  const { variants, flavors } = product
  const [variantId, setVariantId] = useState(variants[0]?.id)
  const [flavor, setFlavor] = useState(flavors.length === 1 ? flavors[0] : undefined)

  const variant = variants.find(v => v.id === variantId)
  const price = variant?.price ?? null
  const orderUrl = productOrderLink({
    name: product.name,
    variant: variant?.label,
    flavor,
    price,
  })

  return (
    <div className="space-y-7">
      <div>
        <Link
          href={`/?category=${product.category}#catalogo`}
          className="text-[11px] font-bold uppercase tracking-[0.16em] text-forest hover:underline"
        >
          {cat.name}
        </Link>
        <h1 className="mt-3 font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl">
          {product.name}
        </h1>
        {price !== null && (
          <p className="mt-4 text-3xl font-bold text-forest">{fmt(price)}</p>
        )}
      </div>

      <p className="text-base leading-relaxed text-ink-soft">{product.description}</p>

      {variants.length > 1 && (
        <OptionGroup label="Presentación">
          {variants.map(v => (
            <OptionButton key={v.id} active={v.id === variantId} onClick={() => setVariantId(v.id)}>
              <span>{v.label}</span>
              <span className={v.id === variantId ? 'text-cream-100/70' : 'text-ink-muted'}>{fmt(v.price)}</span>
            </OptionButton>
          ))}
        </OptionGroup>
      )}

      {flavors.length > 0 && (
        <OptionGroup label={flavors.length > 1 ? 'Sabor' : 'Sabor disponible'}>
          {flavors.map(f => (
            <OptionButton
              key={f}
              active={f === flavor}
              onClick={() => setFlavor(current => (current === f && flavors.length > 1 ? undefined : f))}
            >
              {f}
            </OptionButton>
          ))}
        </OptionGroup>
      )}

      <div className="hidden space-y-4 md:block">
        <a
          href={orderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-forest text-base font-semibold text-cream-100 transition-colors hover:bg-forest-dark"
        >
          <WhatsAppIcon className="h-5 w-5" />
          Pedir por WhatsApp
        </a>
        <Assurances />
      </div>

      <div className="md:hidden">
        <Assurances />
      </div>

      {/* CTA fijo en movil */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-cream-100/95 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3">
          {price !== null && (
            <div className="min-w-0">
              <p className="truncate text-xs text-ink-muted">{variant?.label ?? product.name}</p>
              <p className="text-lg font-bold text-forest">{fmt(price)}</p>
            </div>
          )}
          <a
            href={orderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-forest px-5 text-sm font-semibold text-cream-100 active:bg-forest-dark"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Pedir por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

function OptionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function OptionButton({ active, onClick, children }: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${
        active
          ? 'bg-ink text-cream-100'
          : 'border border-ink/15 bg-cream-100 text-ink hover:border-ink/40'
      }`}
    >
      {children}
    </button>
  )
}

function Assurances() {
  return (
    <ul className="divide-y divide-ink/10 rounded-2xl border border-ink/10 text-sm text-ink-soft">
      <li className="flex items-center gap-3 px-4 py-3">
        <MessageCircle className="h-4 w-4 shrink-0 text-forest" />
        El mensaje sale listo con lo que elegiste.
      </li>
      <li className="flex items-center gap-3 px-4 py-3">
        <PackageCheck className="h-4 w-4 shrink-0 text-forest" />
        Te confirmamos disponibilidad y el total del pedido.
      </li>
    </ul>
  )
}
