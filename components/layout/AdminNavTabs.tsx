'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/admin/comunidades', label: 'Comunidades' },
  { href: '/admin/blog', label: 'Blog' },
]

export function AdminNavTabs() {
  const pathname = usePathname()

  return (
    <nav className="mx-auto flex max-w-3xl gap-1 px-4">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'rounded-t-md px-3 py-2 font-body text-[13px] font-medium transition-colors',
              active
                ? 'bg-creme text-terra'
                : 'text-creme/70 hover:bg-creme/10 hover:text-creme'
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
