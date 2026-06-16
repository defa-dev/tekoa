import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/**
 * Label de seção: uppercase, discreto, separa blocos do feed.
 */
export function SectionLabel({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'font-body font-medium text-[10px] uppercase tracking-[0.07em] text-tinta-mid opacity-70 mb-2',
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}
