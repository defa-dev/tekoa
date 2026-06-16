'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@/components/icons/Icon'
import { NAV_ITEMS, isNavItemActive } from './navItems'
import { cn } from '@/lib/utils'

/**
 * Navegação lateral — visível em tablet (só ícones) e desktop (ícones + texto).
 */
export function SideNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navegação principal"
      className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-palha bg-creme py-4 sm:flex sm:w-[64px] lg:w-[208px]"
    >
      <div className="mb-4 px-3">
        <Link
          href="/dashboard"
          className="flex items-center justify-center lg:justify-start lg:px-1"
          aria-label="Tekoa — início"
        >
          <span className="font-display text-[15px] font-extrabold text-terra lg:text-[20px]">
            Tekoa
          </span>
        </Link>
      </div>

      <ul className="flex flex-1 flex-col gap-1 px-2">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(item.href, pathname)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                title={item.label}
                className={cn(
                  'flex min-h-[44px] items-center gap-3 rounded-md px-3 transition-colors lg:justify-start justify-center',
                  active
                    ? 'bg-terra-light text-terra'
                    : 'text-tinta-mid hover:bg-creme-dark'
                )}
              >
                <Icon
                  name={item.icon}
                  size={20}
                  className={active ? 'text-terra' : 'text-terra/45'}
                />
                <span className="hidden font-body text-sm lg:inline">
                  {item.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="border-t border-palha px-2 pt-2">
        {isAdmin && (
          <Link
            href="/admin/comunidades"
            aria-current={pathname.startsWith('/admin') ? 'page' : undefined}
            title="Administração"
            className={cn(
              'flex min-h-[44px] items-center gap-3 rounded-md px-3 transition-colors lg:justify-start justify-center mb-1',
              pathname.startsWith('/admin')
                ? 'bg-terra-light text-terra'
                : 'text-tinta-mid hover:bg-creme-dark'
            )}
          >
            <Icon
              name="shield"
              size={20}
              className={pathname.startsWith('/admin') ? 'text-terra' : 'text-terra/45'}
            />
            <span className="hidden font-body text-sm lg:inline">Admin</span>
          </Link>
        )}
        <button
          disabled
          title="Em desenvolvimento"
          className="flex min-h-[44px] w-full items-center gap-3 rounded-md px-3 text-tinta-mid/50 cursor-not-allowed lg:justify-start justify-center"
        >
          <Icon name="settings" size={20} className="text-terra/25" />
          <span className="hidden font-body text-sm lg:inline">Config</span>
        </button>
      </div>
    </nav>
  )
}
