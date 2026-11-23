import Image from 'next/image'
import Link from 'next/link'
import { Leaf } from 'lucide-react'
import { SerializedProduct } from '@/types'
import { CATEGORIES } from '@/lib/constants'
import { fmt } from '@/lib/utils'
import { productOrderLink } from '@/lib/whatsapp'
import { WhatsAppIcon } from './icons'

interface Props {
  product: SerializedProduct
  sizes?: string
}

export default function ProductCard({
  product,
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
}: Props) {
  const cat = CATEGORIES[product.category] ?? CATEGORIES.all
  const images = product.images?.filter(Boolean).length
    ? product.images.filter(Boolean)
    : product.imageUrl ? [product.imageUrl] : []
  const minPrice = product.variants.length
    ? Math.min(...product.variants.map(v => v.price))
    : null
  const multiple = product.variants.length > 1

  const orderUrl = productOrderLink({
    name: product.name,
    variant: product.variants.length === 1 ? product.variants[0].label : undefined,
    price: minPrice,
    fromPrice: multiple,
  })

  return (
    <article className="group relative flex flex-col">
      <Link
        href={`/productos/${product.id}`}
        className="flex flex-1 flex-col rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-4 focus-visible:ring-offset-cream"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-cream-200">
          {images.length > 0 ? (
            <>
              <Image
                src={images[0]}
                alt={product.name}
                fill
                sizes={sizes}
                className={`object-contain p-4 mix-blend-multiply transition duration-500 ease-out group-hover:scale-[1.04] sm:p-6 ${
                  images.length > 1 ? '[@media(hover:hover)]:group-hover:opacity-0' : ''
                }`}
              />
              {images.length > 1 && (
                <Image
                  src={images[1]}
                  alt=""
                  fill
                  sizes={sizes}
                  className="hidden object-contain p-4 opacity-0 mix-blend-multiply transition duration-500 ease-out group-hover:scale-[1.04] sm:p-6 [@media(hover:hover)]:block [@media(hover:hover)]:group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="grid h-full w-full place-items-center text-forest/40">
              <Leaf className="h-12 w-12" strokeWidth={1.25} />
            </div>
          )}

          {multiple && (
            <span className="absolute left-3 top-3 rounded-full bg-cream-100/90 px-2.5 py-1 text-[11px] font-semibold text-ink-soft backdrop-blur-sm">
              {product.variants.length} presentaciones
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col px-1 pt-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted sm:text-[11px]">
            {cat.name}
          </p>
          <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-ink sm:text-base">
            {product.name}
          </h3>
          {product.flavors.length > 0 && (
            <p className="mt-1 line-clamp-1 text-xs text-ink-muted">
              {product.flavors.join(' · ')}
            </p>
          )}
          {minPrice !== null && (
            <p className="mt-auto pt-2.5 text-base font-bold text-forest sm:text-lg">
              {multiple && <span className="mr-1 text-xs font-medium text-ink-muted">Desde</span>}
              {fmt(minPrice)}
            </p>
          )}
        </div>
      </Link>

      <a
        href={orderUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Pedir ${product.name} por WhatsApp`}
        className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-forest text-cream-100 shadow-lg shadow-forest/20 transition duration-300 hover:scale-105 hover:bg-forest-dark focus-visible:opacity-100 [@media(hover:hover)]:translate-y-1 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100"
      >
        <WhatsAppIcon className="h-[18px] w-[18px]" />
      </a>
    </article>
  )
}
