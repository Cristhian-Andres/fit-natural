'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'

const MAX_IMAGES = 3

interface Props {
  values: string[]
  blurs: string[]
  uploading: boolean[]
  onChange: (images: string[], blurs: string[]) => void
  onUploadingChange: (uploading: boolean[]) => void
}

export default function MultiImageUpload({ values, blurs, uploading, onChange, onUploadingChange }: Props) {
  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

  async function handleFile(file: File, index: number) {
    if (!file.type.startsWith('image/')) { toast.error('Selecciona una imagen válida'); return }
    if (file.size > 10 * 1024 * 1024) { toast.error('Máximo 10 MB'); return }

    const newUploading = [...uploading]
    newUploading[index] = true
    onUploadingChange(newUploading)

    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Error')
      const { url, blur: blurData } = await res.json()

      const newImages = [...values]
      const newBlurs = [...blurs]
      newImages[index] = url
      newBlurs[index] = blurData
      onChange(newImages, newBlurs)
      toast.success('Imagen subida')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al subir')
    } finally {
      const done = [...uploading]
      done[index] = false
      onUploadingChange(done)
    }
  }

  function removeImage(index: number) {
    const newImages = [...values]
    const newBlurs = [...blurs]
    newImages[index] = ''
    newBlurs[index] = ''
    // Compact: remove empty slots from the middle
    const compacted = newImages.filter(Boolean)
    const compactedBlurs = newBlurs.filter((_, i) => newImages[i])
    onChange(
      [...compacted, ...Array(MAX_IMAGES - compacted.length).fill('')],
      [...compactedBlurs, ...Array(MAX_IMAGES - compactedBlurs.length).fill('')]
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">Hasta {MAX_IMAGES} imágenes. La primera es la imagen principal de la tarjeta.</p>
      <div className="flex gap-3 flex-wrap">
        {Array.from({ length: MAX_IMAGES }).map((_, i) => {
          const hasImage = !!values[i]
          const isUploading = uploading[i]
          const isDisabled = !hasImage && i > 0 && !values[i - 1]

          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                onClick={() => !isDisabled && !isUploading && inputRefs[i].current?.click()}
                className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-colors
                  ${isDisabled ? 'opacity-40 cursor-not-allowed border-gray-200' : 'cursor-pointer hover:border-brand-400'}
                  ${hasImage ? 'border-brand-400' : 'border-gray-300'}
                `}
                style={{ width: 100, height: 100 }}
              >
                {hasImage ? (
                  <Image src={values[i]} alt={`Imagen ${i + 1}`} fill className="object-cover" sizes="100px" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-1">
                    <span className="text-2xl">{i === 0 ? '📷' : '+'}</span>
                    <span className="text-xs text-center px-1">{i === 0 ? 'Principal' : `Foto ${i + 1}`}</span>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="w-6 h-6 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {/* Badge de posición */}
                {hasImage && (
                  <div className="absolute top-1 left-1 bg-brand-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                )}
              </div>

              {hasImage && (
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Quitar
                </button>
              )}

              <input
                ref={inputRefs[i]}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f, i) }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
