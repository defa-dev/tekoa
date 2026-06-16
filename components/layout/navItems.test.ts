import { describe, it, expect } from 'vitest'
import { NAV_ITEMS, isNavItemActive } from './navItems'

describe('NAV_ITEMS', () => {
  it('tem os 5 itens da roda na ordem certa', () => {
    expect(NAV_ITEMS.map((i) => i.href)).toEqual([
      '/dashboard',
      '/trocas',
      '/feira',
      '/avisos',
      '/perfil',
    ])
  })
})

describe('isNavItemActive', () => {
  it('marca Início ativo apenas na rota exata', () => {
    expect(isNavItemActive('/dashboard', '/dashboard')).toBe(true)
    expect(isNavItemActive('/dashboard', '/dashboard/algo')).toBe(false)
  })

  it('marca item ativo na rota exata', () => {
    expect(isNavItemActive('/trocas', '/trocas')).toBe(true)
  })

  it('marca item ativo em sub-rotas', () => {
    expect(isNavItemActive('/trocas', '/trocas/nova')).toBe(true)
    expect(isNavItemActive('/feira', '/feira/abc123')).toBe(true)
  })

  it('não marca item de rota diferente', () => {
    expect(isNavItemActive('/trocas', '/feira')).toBe(false)
  })

  it('não confunde prefixos parciais', () => {
    expect(isNavItemActive('/feira', '/feirao')).toBe(false)
  })
})
