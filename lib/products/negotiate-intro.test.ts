import { describe, it, expect } from 'vitest'
import { buildNegotiateIntro } from './negotiate-intro'

describe('buildNegotiateIntro', () => {
  it('monta mensagem com link markdown para o produto', () => {
    expect(buildNegotiateIntro('Sofá 2 lugares', 'prod-1')).toBe(
      'Gostaria de negociar [Sofá 2 lugares](/feira/prod-1).'
    )
  })
})
