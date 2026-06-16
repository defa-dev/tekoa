import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toggle } from './Toggle'

const options = [
  { value: 'request' as const, label: 'Busco' },
  { value: 'offer' as const, label: 'Ofereço' },
]

describe('Toggle', () => {
  it('renderiza as opções como tabs', () => {
    render(<Toggle options={options} value="request" onChange={() => {}} />)
    expect(screen.getByRole('tab', { name: 'Busco' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Ofereço' })).toBeInTheDocument()
  })

  it('marca a opção ativa com aria-selected', () => {
    render(<Toggle options={options} value="offer" onChange={() => {}} />)
    expect(screen.getByRole('tab', { name: 'Ofereço' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(screen.getByRole('tab', { name: 'Busco' })).toHaveAttribute(
      'aria-selected',
      'false'
    )
  })

  it('chama onChange ao clicar em outra opção', async () => {
    const onChange = vi.fn()
    render(<Toggle options={options} value="request" onChange={onChange} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Ofereço' }))
    expect(onChange).toHaveBeenCalledWith('offer')
  })
})
