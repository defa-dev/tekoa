import { describe, it, expect } from 'vitest'
import { cn, timeAgo, formatBRL, maskCurrencyInput, uid } from './utils'

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

describe('maskCurrencyInput', () => {
  it('formata dígitos como centavos', () => {
    expect(maskCurrencyInput('1234')).toEqual({ display: '12,34', value: 12.34 })
  })

  it('ignora caracteres não numéricos', () => {
    expect(maskCurrencyInput('R$ 1.234,56')).toEqual({ display: '1.234,56', value: 1234.56 })
  })

  it('retorna vazio quando não há dígitos', () => {
    expect(maskCurrencyInput('')).toEqual({ display: '', value: 0 })
    expect(maskCurrencyInput('abc')).toEqual({ display: '', value: 0 })
  })

  it('lida com um único dígito', () => {
    expect(maskCurrencyInput('5')).toEqual({ display: '0,05', value: 0.05 })
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
