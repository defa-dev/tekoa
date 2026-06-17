'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@/components/icons/Icon'
import { BOTTOM_NAV_ITEMS, isNavItemActive } from './navItems'
import { cn } from '@/lib/utils'

/**
 * Navegação inferior fixa — visível apenas no mobile (< 640px).
 * Mostra badge de não-lidas no ícone de Mensagens quando unreadMessages > 0.
 */
export function BottomNav({ unreadMessages = 0 }: { unreadMessages?: number }) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-palha bg-creme sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const active = isNavItemActive(item.href, pathname)
          const showBadge = item.href === '/mensagens' && unreadMessages > 0
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex min-h-[56px] flex-col items-center justify-center gap-1 py-2',
                  active ? 'text-terra' : 'text-terra/45'
                )}
              >
                <span className="relative">
                  <Icon name={item.icon} size={20} />
                  {showBadge && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-terra text-[9px] font-bold text-creme">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </span>
                <span className="font-body text-[9px] leading-none">
                  {item.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
