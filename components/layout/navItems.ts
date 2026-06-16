import type { IconName } from '@/components/icons/Icon'

export interface NavItem {
  href: string
  label: string
  icon: IconName
}

/**
 * Itens de navegação principal. Compartilhados entre bottom nav (mobile)
 * e side nav (tablet/desktop). Ordem reflete a jornada da roda:
 * chegar (início) → trocar → feira → avisos → eu (perfil).
 */
export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Início', icon: 'home' },
  { href: '/trocas', label: 'Trocas', icon: 'exchange' },
  { href: '/feira', label: 'Feira', icon: 'bag' },
  { href: '/avisos', label: 'Avisos', icon: 'speakerphone' },
  { href: '/perfil', label: 'Perfil', icon: 'user' },
]

/**
 * Determina se um item está ativo dado o pathname atual.
 * Considera ativo também as sub-rotas (ex.: /trocas/nova ativa "Trocas").
 */
export function isNavItemActive(itemHref: string, pathname: string): boolean {
  if (itemHref === '/dashboard') return pathname === '/dashboard'
  return pathname === itemHref || pathname.startsWith(itemHref + '/')
}
