import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderPostContent } from './renderPostContent'

describe('renderPostContent', () => {
  it('separa parágrafos por linha em branco', () => {
    render(<>{renderPostContent('Primeiro parágrafo.\n\nSegundo parágrafo.')}</>)
    expect(screen.getByText('Primeiro parágrafo.')).toBeInTheDocument()
    expect(screen.getByText('Segundo parágrafo.')).toBeInTheDocument()
  })

  it('resolve **negrito** dentro de um parágrafo', () => {
    render(<>{renderPostContent('Isto é **importante** de verdade.')}</>)
    const strong = screen.getByText('importante')
    expect(strong.tagName).toBe('STRONG')
  })

  it('ignora linhas em branco extras e parágrafos vazios', () => {
    const result = renderPostContent('Um.\n\n\n\nDois.\n\n')
    expect(result).toHaveLength(2)
  })
})
