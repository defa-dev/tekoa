'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Galeria simples de imagens do produto, com miniaturas quando há mais de uma.
 */
export function ProductGallery({
  images,
  title,
}: {
  images: string[]
  title: string
}) {
  const [active, setActive] = useState(0)
  const list = images?.length ? images : []

  if (list.length === 0) {
    return (
      <div className="flex aspect-square max-h-[420px] w-full items-center justify-center overflow-hidden bg-ouro-light font-body text-ouro">
        sem foto
      </div>
    )
  }

  return (
    <div>
      <div className="aspect-square max-h-[420px] w-full overflow-hidden bg-ouro-light">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={list[active]}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>
      {list.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2">
          {list.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'h-14 w-14 shrink-0 overflow-hidden rounded-md border-2',
                i === active ? 'border-terra' : 'border-transparent'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
