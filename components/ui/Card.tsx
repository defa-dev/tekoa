'use client'

import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean
  interactive?: boolean
}

/**
 * Card base. Profundidade vem de cor de fundo, não de sombra (ver ds.md §6).
 */
export function Card({
  selected = false,
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-creme-dark p-3 border transition-colors',
        selected ? 'border-terra border-[1.5px] bg-terra-light' : 'border-palha',
        interactive && 'cursor-pointer hover:border-ouro',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
