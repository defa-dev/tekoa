import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderMessageContent, stripMessageLinks } from './renderMessageContent'

describe('renderMessageContent', () => {
  it('renderiza texto simples sem alterações', () => {
    render(<>{renderMessageContent('Oi, tudo bem?')}</>)
    expect(screen.getByText('Oi, tudo bem?')).toBeInTheDocument()
  })

  it('converte link markdown em <a> com href correto', () => {
    render(<>{renderMessageContent('Gostaria de negociar [Sofá](/feira/prod-1).')}</>)
    const link = screen.getByRole('link', { name: 'Sofá' })
    expect(link).toHaveAttribute('href', '/feira/prod-1')
  })

  it('mantém texto antes e depois do link', () => {
    render(<>{renderMessageContent('Veja [isso](/feira/x) por favor')}</>)
    expect(screen.getByText(/Veja/)).toBeInTheDocument()
    expect(screen.getByText(/por favor/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'isso' })).toBeInTheDocument()
  })
})

describe('stripMessageLinks', () => {
  it('remove a sintaxe markdown mantendo o texto', () => {
    expect(stripMessageLinks('Gostaria de negociar [Sofá](/feira/prod-1).')).toBe(
      'Gostaria de negociar Sofá.'
    )
  })

  it('não altera texto sem links', () => {
    expect(stripMessageLinks('Mensagem normal')).toBe('Mensagem normal')
  })
})
