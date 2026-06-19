import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./session', () => ({ getCurrentProfile: vi.fn() }))

import { getCurrentProfile } from './session'
import { ensureAdmin } from './admin'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ensureAdmin', () => {
  it('retorna true se o perfil atual é admin', async () => {
    vi.mocked(getCurrentProfile).mockResolvedValue({ is_admin: true } as any)
    expect(await ensureAdmin()).toBe(true)
  })

  it('retorna false se o perfil não é admin', async () => {
    vi.mocked(getCurrentProfile).mockResolvedValue({ is_admin: false } as any)
    expect(await ensureAdmin()).toBe(false)
  })

  it('retorna false se não há perfil', async () => {
    vi.mocked(getCurrentProfile).mockResolvedValue(null)
    expect(await ensureAdmin()).toBe(false)
  })
})
