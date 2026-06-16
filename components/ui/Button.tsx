'use client'

import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark'
type Size = 'md' | 'lg' | 'sm'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-strong font-bold transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 select-none'

const variants: Record<Variant, string> = {
  primary: 'bg-terra text-creme hover:bg-terra-dark',
  secondary:
    'bg-transparent text-terra border border-ouro hover:bg-terra-light',
  ghost: 'bg-transparent text-tinta-mid hover:bg-creme-dark',
  dark: 'bg-tinta text-creme hover:bg-tinta-mid',
}

const sizes: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 min-h-[36px]',
  md: 'text-[13px] px-5 py-2.5 min-h-[44px]',
  lg: 'text-sm px-6 py-3 min-h-[48px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <span
            className="tk-spinner inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent"
            aria-label="Carregando"
          />
        ) : (
          children
        )}
      </button>
    )
  }
)
