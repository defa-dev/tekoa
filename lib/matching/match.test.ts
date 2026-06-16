import { describe, it, expect } from 'vitest'
import {
  isCompatible,
  keywordOverlap,
  findMatches,
  type MatchableService,
} from './match'

function svc(partial: Partial<MatchableService>): MatchableService {
  return {
    id: Math.random().toString(36).slice(2),
    user_id: 'u1',
    title: '',
    description: '',
    type: 'offer',
    category: 'reparos',
    proximity: 5,
    created_at: '2026-06-01T00:00:00Z',
    ...partial,
  }
}

describe('isCompatible', () => {
  it('casa oferta com pedido de mesma categoria, usuários diferentes', () => {
    expect(
      isCompatible(
        { user_id: 'a', type: 'request', category: 'reparos' },
        { user_id: 'b', type: 'offer', category: 'reparos' }
      )
    ).toBe(true)
  })

  it('não casa serviços do mesmo usuário', () => {
    expect(
      isCompatible(
        { user_id: 'a', type: 'request', category: 'reparos' },
        { user_id: 'a', type: 'offer', category: 'reparos' }
      )
    ).toBe(false)
  })

  it('não casa mesmo tipo (oferta com oferta)', () => {
    expect(
      isCompatible(
        { user_id: 'a', type: 'offer', category: 'reparos' },
        { user_id: 'b', type: 'offer', category: 'reparos' }
      )
    ).toBe(false)
  })

  it('não casa categorias diferentes', () => {
    expect(
      isCompatible(
        { user_id: 'a', type: 'request', category: 'reparos' },
        { user_id: 'b', type: 'offer', category: 'aulas' }
      )
    ).toBe(false)
  })
})

describe('keywordOverlap', () => {
  it('é 0 quando não há palavras em comum', () => {
    expect(keywordOverlap('conserto eletrico', 'aula violao')).toBe(0)
  })

  it('é 1 quando os textos têm o mesmo conjunto de palavras', () => {
    expect(keywordOverlap('conserto eletrico', 'eletrico conserto')).toBe(1)
  })

  it('ignora acentos e palavras curtas', () => {
    // "elétrica" ~ "eletrica"; "de"/"da" são curtas e ignoradas
    expect(keywordOverlap('rede elétrica da casa', 'eletrica')).toBeGreaterThan(0)
  })
})

describe('findMatches', () => {
  it('retorna apenas candidatos compatíveis', () => {
    const mine = [svc({ id: 'm1', user_id: 'me', type: 'request', category: 'reparos' })]
    const candidates = [
      svc({ id: 'c1', user_id: 'a', type: 'offer', category: 'reparos' }), // compatível
      svc({ id: 'c2', user_id: 'b', type: 'offer', category: 'aulas' }), // categoria errada
      svc({ id: 'c3', user_id: 'c', type: 'request', category: 'reparos' }), // mesmo tipo
      svc({ id: 'c4', user_id: 'me', type: 'offer', category: 'reparos' }), // mesmo usuário
    ]
    const matches = findMatches(mine, candidates)
    expect(matches.map((m) => m.service.id)).toEqual(['c1'])
  })

  it('ordena por afinidade de texto (score) desc', () => {
    const mine = [
      svc({
        id: 'm1',
        user_id: 'me',
        type: 'request',
        category: 'reparos',
        title: 'Preciso consertar a fiação elétrica',
        description: 'tomada queimada na cozinha',
      }),
    ]
    const candidates = [
      svc({
        id: 'pouco',
        user_id: 'a',
        type: 'offer',
        category: 'reparos',
        title: 'Pintura de parede',
        description: 'pinto sua casa',
      }),
      svc({
        id: 'muito',
        user_id: 'b',
        type: 'offer',
        category: 'reparos',
        title: 'Eletricista: conserto fiação e tomada',
        description: 'fiação elétrica e tomada queimada',
      }),
    ]
    const matches = findMatches(mine, candidates)
    expect(matches[0].service.id).toBe('muito')
    expect(matches[0].score).toBeGreaterThan(matches[1].score)
  })

  it('registra com quais serviços do usuário o candidato casou', () => {
    const mine = [
      svc({ id: 'm1', user_id: 'me', type: 'request', category: 'reparos' }),
      svc({ id: 'm2', user_id: 'me', type: 'request', category: 'aulas' }),
    ]
    const candidates = [
      svc({ id: 'c1', user_id: 'a', type: 'offer', category: 'reparos' }),
    ]
    const matches = findMatches(mine, candidates)
    expect(matches[0].matchedWith).toEqual(['m1'])
  })

  it('retorna vazio quando o usuário não tem serviços', () => {
    const candidates = [svc({ user_id: 'a', type: 'offer' })]
    expect(findMatches([], candidates)).toEqual([])
  })

  it('desempata por recência quando o score é igual', () => {
    const mine = [svc({ id: 'm1', user_id: 'me', type: 'request', category: 'reparos' })]
    const candidates = [
      svc({ id: 'velho', user_id: 'a', type: 'offer', category: 'reparos', created_at: '2026-06-01T00:00:00Z' }),
      svc({ id: 'novo', user_id: 'b', type: 'offer', category: 'reparos', created_at: '2026-06-10T00:00:00Z' }),
    ]
    const matches = findMatches(mine, candidates)
    expect(matches[0].service.id).toBe('novo')
  })
})
