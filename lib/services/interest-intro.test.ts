import { describe, it, expect } from 'vitest'
import { buildInterestIntro } from './interest-intro'

describe('buildInterestIntro', () => {
  it('mensagem simples sem ofertas cadastradas', () => {
    expect(buildInterestIntro('Felipe', 'Aula de violão', [])).toBe(
      'Oi! Felipe tem interesse em "Aula de violão".'
    )
  })

  it('inclui uma oferta cadastrada', () => {
    expect(
      buildInterestIntro('Felipe', 'Aula de violão', [
        { title: 'Conserto elétrico', type: 'offer' },
      ])
    ).toBe(
      'Oi! Felipe tem interesse em "Aula de violão" e pode oferecer: Conserto elétrico.'
    )
  })

  it('lista várias ofertas e ignora pedidos', () => {
    const msg = buildInterestIntro('Ana', 'Mutirão', [
      { title: 'Pedido X', type: 'request' },
      { title: 'Jardinagem', type: 'offer' },
      { title: 'Costura', type: 'offer' },
    ])
    expect(msg).toContain('Jardinagem')
    expect(msg).toContain('Costura')
    expect(msg).not.toContain('Pedido X')
  })
})
