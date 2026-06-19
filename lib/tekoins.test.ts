import { describe, it, expect } from 'vitest'
import { tekoinsForRating, AVISO_TEKOIN_REWARD, AVISO_DAILY_CAP } from './tekoins'

describe('tekoinsForRating', () => {
  it.each([
    [5, 10],
    [4, 7],
    [3, 4],
    [2, 1],
    [1, 0],
  ])('mapeia %i estrelas para %i Tekoins', (rating, expected) => {
    expect(tekoinsForRating(rating)).toBe(expected)
  })

  it('retorna 0 para valores fora da tabela', () => {
    expect(tekoinsForRating(0)).toBe(0)
    expect(tekoinsForRating(6)).toBe(0)
  })
})

describe('constantes de aviso', () => {
  it('tem valores positivos e cap razoável', () => {
    expect(AVISO_TEKOIN_REWARD).toBeGreaterThan(0)
    expect(AVISO_DAILY_CAP).toBeGreaterThan(0)
  })
})
