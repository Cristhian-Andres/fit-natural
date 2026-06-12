'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Props {
  images: string[]
  blurs: string[]
  alt: string
  emoji: string
  bgColor: string
}

export default function ProductGallery({ images, blurs, alt, emoji, bgColor }: Props) {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent(c => (c - 1 + images.length) % images.length)
  const next = () => setCurrent(c => (c + 1) % images.length)

  if (images.length === 0) {
    return (
      <div
        className="w-full aspect-square rounded-2xl flex items-center justify-center text-8xl"
        style={{ background: bgColor }}
      >
        {emoji}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Imagen principal */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-md">
        <Image
          src={images[current]}
          alt={`${alt} ${current + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
          placeholder={blurs[current] ? 'blur' : 'empty'}
          blurDataURL={blurs[current] || undefined}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />

        {/* Flechas de navegación */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-800 rounded-full w-9 h-9 flex items-center justify-center shadow-md transition-all text-lg font-bold"
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-800 rounded-full w-9 h-9 flex items-center justify-center shadow-md transition-all text-lg font-bold"
              aria-label="Siguiente"
            >
              ›
            </button>
          </>
        )}

        {/* Indicador de posición */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current ? 'bg-white scale-125' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="flex gap-2 justify-center">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                i === current
                  ? 'border-brand-500 shadow-md scale-105'
                  : 'border-gray-200 opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={img}
                alt={`${alt} miniatura ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
