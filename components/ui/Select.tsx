'use client'

import { forwardRef, useId } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

const fieldLabel =
  'block font-body font-medium text-[10px] uppercase tracking-[0.07em] text-tinta-mid mb-1.5'

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { label, error, options, placeholder, className, id, ...props },
    ref
  ) {
    const generatedId = useId()
    const fieldId = id || generatedId

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={fieldId} className={fieldLabel}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={fieldId}
          aria-invalid={!!error}
          className={cn(
            'w-full rounded-md bg-creme-dark px-3 py-2.5 font-body text-sm text-tinta',
            'border border-palha focus:border-terra focus:outline-none focus-visible:outline-none',
            'appearance-none bg-no-repeat',
            error && 'border-erro',
            className
          )}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234a3d33' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6l6 -6'/%3E%3C/svg%3E\")",
            backgroundPosition: 'right 12px center',
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 font-body text-[11px] text-erro">{error}</p>
        )}
      </div>
    )
  }
)
