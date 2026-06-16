import { expect, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Polyfill para React.act no ambiente de testes com React 19
beforeAll(() => {
  const React = require('react')
  
  if (!React.act) {
    React.act = function act(callback: () => void | Promise<void>): Promise<void> {
      const result = callback()
      if (result && typeof result === 'object' && 'then' in result) {
        return result as Promise<void>
      }
      return Promise.resolve()
    }
  }
})

// Cleanup after each test
afterEach(() => {
  cleanup()
})
