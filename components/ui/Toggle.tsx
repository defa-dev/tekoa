'use client'

import { cn } from '@/lib/utils'

export interface ToggleOption<T extends string> {
  value: T
  label: string
}

export interface ToggleProps<T extends string> {
  options: ToggleOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
  'aria-label'?: string
}

/**
 * Toggle em pílula (ex.: Busco / Ofereço). Acessível via roles de tab.
 */
export function Toggle<T extends string>({
  options,
  value,
  onChange,
  className,
  'aria-label': ariaLabel,
}: ToggleProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex rounded-full border border-palha bg-creme-dark p-0.5',
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-full px-4 py-1.5 font-body text-[13px] font-medium transition-colors min-h-[36px]',
              active ? 'bg-terra text-creme' : 'text-tinta-mid hover:text-tinta'
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
