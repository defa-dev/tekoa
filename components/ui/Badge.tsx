import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type BadgeType =
  | 'novo'
  | 'aviso'
  | 'feira'
  | 'troca'
  | 'categoria'
  | 'evento'
  | 'comunidade'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  type?: BadgeType
}

const styles: Record<BadgeType, string> = {
  novo: 'bg-terra text-creme',
  aviso: 'bg-musgo-light text-musgo',
  evento: 'bg-musgo-light text-musgo',
  feira: 'bg-ouro-light text-tinta-mid',
  categoria: 'bg-ouro-light text-tinta-mid',
  troca: 'bg-tinta/[0.08] text-tinta-mid',
  comunidade: 'bg-creme/15 text-creme border border-creme/30',
}

export function Badge({
  type = 'categoria',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-1.5 py-0.5 font-body font-medium',
        'text-[10px] uppercase tracking-[0.06em] leading-none',
        styles[type],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
