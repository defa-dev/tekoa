import type { IconName } from '@/components/icons/Icon'

export interface NavItem {
  href: string
  label: string
  icon: IconName
}

/**
 * Itens de navegação — SideNav (tablet/desktop): inclui Avisos e Mensagens.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Início', icon: 'home' },
  { href: '/trocas', label: 'Trocas', icon: 'exchange' },
  { href: '/feira', label: 'Feira', icon: 'bag' },
  { href: '/avisos', label: 'Avisos', icon: 'speakerphone' },
  { href: '/mensagens', label: 'Mensagens', icon: 'message' },
  { href: '/perfil', label: 'Perfil', icon: 'user' },
]

/**
 * Itens de navegação — BottomNav (mobile): 5 slots fixos.
 * Avisos fica disponível via SideNav no tablet/desktop.
 */
export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Início', icon: 'home' },
  { href: '/trocas', label: 'Trocas', icon: 'exchange' },
  { href: '/feira', label: 'Feira', icon: 'bag' },
  { href: '/mensagens', label: 'Msgs', icon: 'message' },
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
