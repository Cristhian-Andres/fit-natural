'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Leaf } from 'lucide-react'

interface Props {
  images: string[]
  /** Se ignora: el placeholder blur deja un halo sobre el fondo crema */
  blurs?: string[]
  alt: string
}

export default function ProductGallery({ images, alt }: Props) {
  const [current, setCurrent] = useState(0)
  const track = useRef<HTMLDivElement>(null)

  // Carrusel con scroll-snap: deslizar con el dedo en movil, flechas en escritorio.
  const goTo = (i: number) => {
    const el = track.current
    if (!el) return
    const index = (i + images.length) % images.length
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' })
  }

  const onScroll = () => {
    const el = track.current
    if (!el) return
    setCurrent(Math.round(el.scrollLeft / el.clientWidth))
  }

  if (images.length === 0) {
    return (
      <div className="grid aspect-square w-full place-items-center rounded-[28px] bg-cream-200 text-forest/40">
        <Leaf className="h-20 w-20" strokeWidth={1} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div
          ref={track}
          onScroll={onScroll}
          className="flex aspect-square snap-x snap-mandatory overflow-x-auto rounded-[28px] bg-cream-200 scrollbar-hide"
        >
          {images.map((src, i) => (
            <div key={src} className="relative h-full w-full shrink-0 snap-center">
              <Image
                src={src}
                alt={`${alt}${images.length > 1 ? ` (${i + 1} de ${images.length})` : ''}`}
                fill
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-contain p-8 mix-blend-multiply sm:p-14"
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(current - 1)}
              aria-label="Imagen anterior"
              className="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-cream-100/90 text-ink shadow-sm backdrop-blur-sm transition hover:bg-cream-100 md:grid"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(current + 1)}
              aria-label="Imagen siguiente"
              className="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-cream-100/90 text-ink shadow-sm backdrop-blur-sm transition hover:bg-cream-100 md:grid"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i === current ? 'w-5 bg-ink' : 'w-1.5 bg-ink/25'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="hidden gap-3 md:flex">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={`relative h-20 w-20 overflow-hidden rounded-2xl bg-cream-200 transition ${
                i === current ? 'ring-2 ring-ink ring-offset-2 ring-offset-cream' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-contain p-2 mix-blend-multiply" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
