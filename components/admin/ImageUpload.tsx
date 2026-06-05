'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'

interface Props {
  value?: string | null
  blur?: string | null
  onChange: (url: string, blur: string) => void
}

export default function ImageUpload({ value, blur, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value ?? null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Selecciona una imagen válida')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen no puede superar 10 MB')
      return
    }

    setUploading(true)
    const local = URL.createObjectURL(file)
    setPreview(local)

    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Error al subir')
      const { url, blur: blurData } = await res.json()
      onChange(url, blurData)
      setPreview(url)
      toast.success('Imagen subida')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al subir la imagen')
      setPreview(value ?? null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-colors ${
          uploading ? 'opacity-60 cursor-not-allowed' : 'border-gray-300 hover:border-brand-400'
        }`}
        style={{ aspectRatio: '1/1', maxWidth: 220 }}
      >
        {preview ? (
          <Image
            src={preview}
            alt="Vista previa"
            fill
            className="object-cover"
            placeholder={blur ? 'blur' : 'empty'}
            blurDataURL={blur ?? undefined}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-1">
            <span className="text-3xl">📷</span>
            <span className="text-xs text-center px-2">Click para subir imagen</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />

      {preview && (
        <button
          type="button"
          onClick={() => { setPreview(null); onChange('', '') }}
          className="text-xs text-red-500 hover:text-red-700"
        >
          Quitar imagen
        </button>
      )}
    </div>
  )
}
