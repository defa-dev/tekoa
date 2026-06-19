'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@/components/icons/Icon'
import { MORE_NAV_ITEMS, isNavItemActive } from './navItems'
import { cn } from '@/lib/utils'

/**
 * Botão flutuante "Mais" — visível apenas no mobile (< 640px), acima do
 * BottomNav. Abre uma folha com os temas que não cabem no rodapé fixo
 * (hoje só Avisos), sem precisar disputar um dos 5 slots cada vez que
 * surge uma seção nova.
 */
export function MoreMenuFab() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Mais opções"
        className="fixed right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-terra text-creme shadow-lg shadow-tinta/25 transition-transform active:scale-95 sm:hidden"
        style={{ bottom: 'calc(56px + env(safe-area-inset-bottom) + 14px)' }}
      >
        <Icon name="menu" size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:hidden">
          <button
            type="button"
            aria-label="Fechar"
            className="absolute inset-0 bg-tinta/40"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-[480px] rounded-t-2xl bg-creme p-4 pb-safe">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-[16px] font-bold text-tinta">Mais</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="flex h-8 w-8 items-center justify-center rounded-md text-tinta-mid hover:bg-creme-dark"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <ul className="flex flex-col gap-1 pb-2">
              {MORE_NAV_ITEMS.map((item) => {
                const active = isNavItemActive(item.href, pathname)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-3 transition-colors',
                        active ? 'bg-terra-light text-terra' : 'text-tinta hover:bg-creme-dark'
                      )}
                    >
                      <Icon
                        name={item.icon}
                        size={20}
                        className={active ? 'text-terra' : 'text-terra/60'}
                      />
                      <span className="font-body text-sm">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
