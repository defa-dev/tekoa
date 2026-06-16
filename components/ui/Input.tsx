'use client'

import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const fieldLabel =
  'block font-body font-medium text-[10px] uppercase tracking-[0.07em] text-tinta-mid mb-1.5'

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, ...props },
  ref
) {
  const generatedId = useId()
  const inputId = id || generatedId

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className={fieldLabel}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        className={cn(
          'w-full rounded-md bg-creme-dark px-3 py-2.5 font-body text-sm text-tinta',
          'placeholder:text-tinta-light',
          'border border-palha focus:border-terra focus:outline-none focus-visible:outline-none',
          error && 'border-erro',
          className
        )}
        {...props}
      />
      {error ? (
        <p className="mt-1 font-body text-[11px] text-erro">{error}</p>
      ) : hint ? (
        <p className="mt-1 font-body text-[11px] text-tinta-light">{hint}</p>
      ) : null}
    </div>
  )
})
