'use client'

import { useRef, useState } from 'react'
import { uploadImages } from '@/lib/storage/upload'
import { Icon } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'

interface ImageUploaderProps {
  bucket: 'products' | 'mural' | 'blog'
  userId: string
  max?: number
  value: string[]
  onChange: (urls: string[]) => void
  onError?: (msg: string) => void
}

/**
 * Seletor + upload de imagens (direto para o Storage). Mostra miniaturas e
 * permite remover. Mantém a lista de URLs no componente pai.
 */
export function ImageUploader({
  bucket,
  userId,
  max = 5,
  value,
  onChange,
  onError,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const remaining = max - value.length
    const chosen = Array.from(files).slice(0, remaining)
    if (chosen.length === 0) {
      onError?.(`Máximo de ${max} imagens.`)
      return
    }

    setUploading(true)
    const res = await uploadImages(bucket, userId, chosen)
    setUploading(false)

    if (res.urls.length) onChange([...value, ...res.urls])
    if (res.error) onError?.(res.error)
    if (inputRef.current) inputRef.current.value = ''
  }

  function remove(url: string) {
    onChange(value.filter((u) => u !== url))
  }

  return (
    <div>
      <p className="mb-1.5 font-body text-[10px] font-medium uppercase tracking-[0.07em] text-tinta-mid">
        Fotos
      </p>
      <div className="grid grid-cols-3 gap-2">
        {value.map((url) => (
          <div
            key={url}
            className="relative aspect-square overflow-hidden rounded-md border border-palha"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(url)}
              aria-label="Remover imagem"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-tinta/70 text-creme"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              'flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed border-ouro bg-creme-dark text-tinta-mid',
              uploading && 'opacity-60'
            )}
          >
            {uploading ? (
              <span className="tk-spinner h-5 w-5 rounded-full border-2 border-terra border-t-transparent" />
            ) : (
              <>
                <Icon name="camera" size={22} className="text-terra" />
                <span className="font-body text-[10px]">Adicionar</span>
              </>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
