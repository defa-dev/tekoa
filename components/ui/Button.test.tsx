import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renderiza o texto', () => {
    render(<Button>Entrar na roda</Button>)
    expect(screen.getByRole('button', { name: 'Entrar na roda' })).toBeInTheDocument()
  })

  it('dispara onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Ok</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('não dispara quando desabilitado', async () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        Ok
      </Button>
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('mostra spinner e desabilita quando loading', () => {
    render(<Button loading>Salvar</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(screen.getByLabelText('Carregando')).toBeInTheDocument()
  })

  it('aplica variante secundária', () => {
    render(<Button variant="secondary">Voltar</Button>)
    expect(screen.getByRole('button').className).toContain('border-ouro')
  })
})
