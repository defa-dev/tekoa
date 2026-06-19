import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MoreMenuFab } from './MoreMenuFab'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

describe('MoreMenuFab', () => {
  it('não mostra os itens secundários antes de abrir', () => {
    render(<MoreMenuFab />)
    expect(screen.queryByText('Avisos')).not.toBeInTheDocument()
  })

  it('abre a folha com Avisos ao clicar no botão flutuante', async () => {
    const user = userEvent.setup()
    render(<MoreMenuFab />)

    await user.click(screen.getByRole('button', { name: 'Mais opções' }))

    expect(screen.getByText('Avisos')).toBeInTheDocument()
  })

  it('fecha a folha ao clicar em fechar', async () => {
    const user = userEvent.setup()
    render(<MoreMenuFab />)

    await user.click(screen.getByRole('button', { name: 'Mais opções' }))
    expect(screen.getByText('Avisos')).toBeInTheDocument()

    const closeButtons = screen.getAllByRole('button', { name: 'Fechar' })
    await user.click(closeButtons[closeButtons.length - 1])
    expect(screen.queryByText('Avisos')).not.toBeInTheDocument()
  })
})
