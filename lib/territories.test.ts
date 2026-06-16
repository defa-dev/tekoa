import { describe, it, expect } from 'vitest'
import { territoryOrFilter, communityKindLabel } from './territories'

describe('territoryOrFilter', () => {
  it('inclui alcance global, comunidade de origem e lista selecionada', () => {
    expect(territoryOrFilter('Massaguaçu')).toBe(
      'reach.eq.all,community.eq.Massaguaçu,reach_communities.cs.{Massaguaçu}'
    )
  })

  it('sanitiza vírgulas e parênteses no nome da comunidade', () => {
    expect(territoryOrFilter('Vila (Centro), SP')).toBe(
      'reach.eq.all,community.eq.Vila  Centro   SP,reach_communities.cs.{Vila  Centro   SP}'
    )
  })
})

describe('communityKindLabel', () => {
  it('retorna o rótulo da alcunha', () => {
    expect(communityKindLabel('quilombo')).toBe('Quilombo')
  })

  it('retorna vazio para valor ausente', () => {
    expect(communityKindLabel(null)).toBe('')
  })
})
