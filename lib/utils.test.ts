import { describe, it, expect } from 'vitest'
import { cn, timeAgo, formatBRL, uid } from './utils'

describe('cn', () => {
  it('junta classes simples', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('ignora valores falsy', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b')
  })

  it('resolve condicionais', () => {
    const active = true
    const disabled = false
    expect(cn('base', active && 'on', disabled && 'off')).toBe('base on')
  })

  it('achata arrays aninhados', () => {
    expect(cn('a', ['b', ['c', false]])).toBe('a b c')
  })
})

describe('timeAgo', () => {
  const now = new Date('2026-06-14T12:00:00Z')

  it('retorna "agora" para segundos', () => {
    expect(timeAgo('2026-06-14T11:59:30Z', now)).toBe('agora')
  })

  it('formata minutos', () => {
    expect(timeAgo('2026-06-14T11:45:00Z', now)).toBe('há 15min')
  })

  it('formata horas', () => {
    expect(timeAgo('2026-06-14T10:00:00Z', now)).toBe('há 2h')
  })

  it('formata dias', () => {
    expect(timeAgo('2026-06-12T12:00:00Z', now)).toBe('há 2d')
  })

  it('não retorna tempo negativo para datas futuras', () => {
    expect(timeAgo('2026-06-14T13:00:00Z', now)).toBe('agora')
  })
})

describe('formatBRL', () => {
  it('formata como real brasileiro', () => {
    const out = formatBRL(150)
    expect(out).toContain('R$')
    expect(out).toContain('150')
  })

  it('inclui centavos', () => {
    expect(formatBRL(12.5)).toContain('12,50')
  })
})

describe('uid', () => {
  it('gera ids únicos', () => {
    const a = uid()
    const b = uid()
    expect(a).not.toBe(b)
  })

  it('respeita o prefixo', () => {
    expect(uid('user').startsWith('user_')).toBe(true)
  })
})
