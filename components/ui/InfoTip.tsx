'use client'

import { useState } from 'react'
import { Icon } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'

/**
 * Ícone de informação com um balão explicativo que abre ao toque/clique.
 * Fecha ao clicar fora. Pensado para explicar termos (ex.: o nome "Jopói").
 */
export function InfoTip({
  children,
  label = 'Saiba mais',
  align = 'left',
}: {
  children: React.ReactNode
  label?: string
  align?: 'left' | 'right'
}) {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
          open ? 'bg-creme/20 text-creme' : 'text-creme/75 hover:bg-creme/15 hover:text-creme'
        )}
      >
        <Icon name="info" size={18} />
      </button>

      {open && (
        <>
          <button
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="tooltip"
            className={cn(
              'absolute top-9 z-50 w-64 rounded-lg border border-palha bg-creme p-3 shadow-xl',
              align === 'left' ? 'left-0' : 'right-0'
            )}
          >
            <div className="font-body text-[13px] leading-relaxed text-tinta-mid">
              {children}
            </div>
          </div>
        </>
      )}
    </span>
  )
}
