import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TopBar } from './TopBar'
import { TekoinBalanceProvider } from './TekoinBalanceContext'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: vi.fn() }),
}))

describe('TopBar', () => {
  it('mostra o saldo de Tekoins do contexto, com link pro extrato', () => {
    render(
      <TekoinBalanceProvider value={42}>
        <TopBar title="Trocas" />
      </TekoinBalanceProvider>
    )

    const link = screen.getByRole('link', { name: 'Saldo de 42 Tekoins' })
    expect(link).toHaveAttribute('href', '/perfil/tekoins')
    expect(link).toHaveTextContent('42')
  })

  it('usa 0 como padrão quando não há provider de saldo', () => {
    render(<TopBar title="Trocas" />)
    expect(screen.getByRole('link', { name: 'Saldo de 0 Tekoins' })).toBeInTheDocument()
  })
})
