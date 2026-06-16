import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renderiza o conteúdo', () => {
    render(<Badge>Novo</Badge>)
    expect(screen.getByText('Novo')).toBeInTheDocument()
  })

  it('aplica estilo do tipo novo', () => {
    render(<Badge type="novo">Novo</Badge>)
    expect(screen.getByText('Novo').className).toContain('bg-terra')
  })

  it('aplica estilo do tipo aviso', () => {
    render(<Badge type="aviso">Aviso</Badge>)
    expect(screen.getByText('Aviso').className).toContain('bg-musgo-light')
  })
})
