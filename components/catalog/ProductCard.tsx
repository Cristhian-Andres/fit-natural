'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SerializedProduct } from '@/types'
import { CATEGORIES } from '@/lib/constants'
import { fmt } from '@/lib/utils'

interface Props {
  product: SerializedProduct
}

export default function ProductCard({ product }: Props) {
  const router = useRouter()
  const cat = CATEGORIES[product.category] ?? CATEGORIES.all
  const minPrice = product.variants.length
    ? Math.min(...product.variants.map(v => v.price))
    : null
  const maxPrice = product.variants.length
    ? Math.max(...product.variants.map(v => v.price))
    : null

  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER ?? '573148375549'
  const waText = encodeURIComponent(
    `Hola! Me interesa el producto: *${product.name}*${minPrice ? ` (desde ${fmt(minPrice)})` : ''}. ¿Tienen disponibilidad?`
  )
  const waUrl = `https://wa.me/${waNumber}?text=${waText}`

  return (
    <div
      className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col cursor-pointer
        transition-all duration-200
        hover:shadow-[6px_0_22px_-4px_rgba(124,179,66,0.35),_-6px_0_22px_-4px_rgba(124,179,66,0.35),_0_6px_20px_-4px_rgba(124,179,66,0.2)]
        active:scale-[0.98] active:shadow-[3px_0_12px_-4px_rgba(124,179,66,0.4),_-3px_0_12px_-4px_rgba(124,179,66,0.4)]"
      onClick={() => router.push(`/productos/${product.id}`)}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            placeholder={product.imageBlur ? 'blur' : 'empty'}
            blurDataURL={product.imageBlur ?? undefined}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-5xl"
            style={{ background: cat.light }}
          >
            {product.emoji}
          </div>
        )}
        {/* Category badge */}
        <span
          className="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: cat.light, color: cat.color }}
        >
          {cat.emoji} {cat.name}
        </span>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug">
          {product.name}
        </h3>

        <p className="text-gray-500 text-xs line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* Flavors */}
        {product.flavors.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.flavors.slice(0, 3).map(f => (
              <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {f}
              </span>
            ))}
            {product.flavors.length > 3 && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                +{product.flavors.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Variants / Price */}
        {product.variants.length > 0 && (
          <div className="space-y-0.5">
            {product.variants.length === 1 ? (
              <p className="text-brand-700 font-bold text-base">
                {fmt(product.variants[0].price)}
              </p>
            ) : (
              <>
                <p className="text-brand-700 font-bold text-base">
                  Desde {fmt(minPrice!)}
                </p>
                <div className="flex flex-wrap gap-1">
                  {product.variants.map(v => (
                    <span key={v.id} className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                      {v.label} · {fmt(v.price)}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="mt-1 flex gap-2">
          <Link
            href={`/productos/${product.id}`}
            onClick={e => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1 border border-brand-600 text-brand-700 hover:bg-brand-50 text-sm font-semibold py-2 rounded-xl transition-colors"
          >
            Ver más
          </Link>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12.002 0C5.373 0 .001 5.373.001 12c0 2.117.554 4.104 1.523 5.827L0 24l6.335-1.524A11.955 11.955 0 0012.002 24c6.628 0 12-5.373 12-12s-5.372-12-11.998-12zm0 21.818a9.809 9.809 0 01-4.996-1.368l-.357-.213-3.722.896.924-3.634-.232-.373A9.796 9.796 0 012.183 12c0-5.417 4.402-9.818 9.819-9.818 5.416 0 9.818 4.401 9.818 9.818 0 5.416-4.402 9.818-9.818 9.818z"/>
            </svg>
            Pedir
          </a>
        </div>
      </div>
    </div>
  )
}
