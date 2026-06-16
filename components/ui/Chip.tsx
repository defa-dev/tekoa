'use client'

import { cn } from '@/lib/utils'

export interface ChipProps {
  label: string
  active?: boolean
  onClick?: () => void
}

/**
 * Chip de filtro horizontal (categorias de feira/mural).
 */
export function Chip({ label, active = false, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'shrink-0 rounded-full px-3.5 py-1.5 font-body text-[13px] transition-colors whitespace-nowrap min-h-[36px]',
        active
          ? 'bg-terra text-creme'
          : 'bg-creme-dark text-tinta-mid border border-palha hover:border-ouro'
      )}
    >
      {label}
    </button>
  )
}
