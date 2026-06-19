import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth/session', () => ({ getCurrentProfile: vi.fn() }))
vi.mock('@/data/mural.service', () => ({ getMuralService: vi.fn() }))
vi.mock('@/data/tekoin.service', () => ({ getTekoinService: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { getCurrentProfile } from '@/lib/auth/session'
import { getMuralService } from '@/data/mural.service'
import { getTekoinService } from '@/data/tekoin.service'
import { createPostAction } from './actions'

const mockProfile = { id: 'user-1', location: 'Jardim das Acácias' }
const mockPost = { id: 'post-1' }

function setupMocks() {
  const createPost = vi.fn().mockResolvedValue({ success: true, data: mockPost })
  vi.mocked(getMuralService).mockReturnValue({ createPost } as any)

  const mintAvisoReward = vi.fn().mockResolvedValue({ success: true, data: null })
  const checkAndAwardBadges = vi.fn().mockResolvedValue({ success: true, data: [] })
  vi.mocked(getTekoinService).mockReturnValue({ mintAvisoReward, checkAndAwardBadges } as any)

  return { createPost, mintAvisoReward, checkAndAwardBadges }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getCurrentProfile).mockResolvedValue(mockProfile as any)
})

describe('createPostAction', () => {
  it('retorna erro se não autenticado', async () => {
    vi.mocked(getCurrentProfile).mockResolvedValue(null)
    const res = await createPostAction({ title: 'Oi gente', content: 'Conteúdo bem aqui' })
    expect(res.success).toBe(false)
  })

  it('publica o aviso e credita Tekoin pelo post criado', async () => {
    const { createPost, mintAvisoReward } = setupMocks()

    const res = await createPostAction({ title: 'Oi gente', content: 'Conteúdo bem aqui' })

    expect(res.success).toBe(true)
    expect(createPost).toHaveBeenCalledWith('user-1', expect.objectContaining({ community: 'Jardim das Acácias' }))
    expect(mintAvisoReward).toHaveBeenCalledWith('user-1', 'post-1')
  })

  it('não falha a publicação se a mineração de Tekoin der erro', async () => {
    const { mintAvisoReward } = setupMocks()
    mintAvisoReward.mockRejectedValue(new Error('boom'))

    const res = await createPostAction({ title: 'Oi gente', content: 'Conteúdo bem aqui' })

    expect(res.success).toBe(true)
  })

  it('propaga erro se a publicação falhar', async () => {
    const createPost = vi.fn().mockResolvedValue({ success: false, error: { message: 'Erro' } })
    vi.mocked(getMuralService).mockReturnValue({ createPost } as any)

    const res = await createPostAction({ title: 'Oi gente', content: 'Conteúdo bem aqui' })
    expect(res.success).toBe(false)
  })
})
