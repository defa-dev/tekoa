import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageHeader } from './PageHeader'
import { TekoinBalanceProvider } from './TekoinBalanceContext'

describe('PageHeader', () => {
  it('mostra o saldo de Tekoins do contexto, com link pro extrato', () => {
    render(
      <TekoinBalanceProvider value={42}>
        <PageHeader title="Início" />
      </TekoinBalanceProvider>
    )

    const link = screen.getByRole('link', { name: 'Saldo de 42 Tekoins' })
    expect(link).toHaveAttribute('href', '/perfil/tekoins')
    expect(link).toHaveTextContent('42')
  })

  it('usa 0 como padrão quando não há provider de saldo', () => {
    render(<PageHeader title="Início" />)
    expect(screen.getByRole('link', { name: 'Saldo de 0 Tekoins' })).toBeInTheDocument()
  })
})
