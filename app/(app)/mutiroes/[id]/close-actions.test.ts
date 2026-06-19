import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth/session', () => ({ getAuthUser: vi.fn() }))
vi.mock('@/data/mutirao-payout.service', () => ({ getMutiraoPayoutService: vi.fn() }))
vi.mock('@/data/mutirao.service', () => ({ getMutiraoService: vi.fn() }))
vi.mock('@/data/tekoin.service', () => ({ getTekoinService: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { getAuthUser } from '@/lib/auth/session'
import { getMutiraoPayoutService } from '@/data/mutirao-payout.service'
import { getMutiraoService } from '@/data/mutirao.service'
import { getTekoinService } from '@/data/tekoin.service'
import { closeMutiraoAction, rateOrganizerAction } from './close-actions'

const mockUser = { id: 'user-1', email: 'u1@test.com' }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getAuthUser).mockResolvedValue(mockUser as any)
})

describe('closeMutiraoAction', () => {
  it('retorna erro se não autenticado', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null)
    const res = await closeMutiraoAction('mut-1', [])
    expect(res.success).toBe(false)
  })

  it('chama o orquestrador com o organizador da sessão', async () => {
    const closeMutirao = vi
      .fn()
      .mockResolvedValue({ success: true, data: { baseAwarded: [], extraDistributed: 0 } })
    vi.mocked(getMutiraoPayoutService).mockReturnValue({ closeMutirao } as any)

    const attendance = [{ userId: 'user-2', attended: true, rating: 5 }]
    const res = await closeMutiraoAction('mut-1', attendance, 10)

    expect(res.success).toBe(true)
    expect(closeMutirao).toHaveBeenCalledWith('mut-1', 'user-1', attendance, 10)
  })
})

describe('rateOrganizerAction', () => {
  it('bloqueia avaliar organizador de mutirão ainda não concluído', async () => {
    vi.mocked(getMutiraoService).mockReturnValue({
      getMutiraoById: vi.fn().mockResolvedValue({
        success: true,
        data: { id: 'mut-1', organizer_id: 'organizer-1', status: 'confirmed' },
      }),
    } as any)

    const res = await rateOrganizerAction('mut-1', 5)
    expect(res.success).toBe(false)
  })

  it('bloqueia o organizador de avaliar a si mesmo', async () => {
    vi.mocked(getMutiraoService).mockReturnValue({
      getMutiraoById: vi.fn().mockResolvedValue({
        success: true,
        data: { id: 'mut-1', organizer_id: 'user-1', status: 'completed' },
      }),
    } as any)

    const res = await rateOrganizerAction('mut-1', 5)
    expect(res.success).toBe(false)
  })

  it('credita Tekoin ao organizador quando avaliado por um participante', async () => {
    vi.mocked(getMutiraoService).mockReturnValue({
      getMutiraoById: vi.fn().mockResolvedValue({
        success: true,
        data: { id: 'mut-1', organizer_id: 'organizer-1', status: 'completed' },
      }),
    } as any)
    const mintMutiraoBaseReward = vi.fn().mockResolvedValue({ success: true, data: null })
    const hasMutiraoRating = vi.fn().mockResolvedValue({ success: true, data: false })
    vi.mocked(getTekoinService).mockReturnValue({ mintMutiraoBaseReward, hasMutiraoRating } as any)

    const res = await rateOrganizerAction('mut-1', 5)

    expect(res.success).toBe(true)
    expect(mintMutiraoBaseReward).toHaveBeenCalledWith('organizer-1', 'user-1', 5, 'mut-1')
  })

  it('bloqueia avaliar o organizador duas vezes no mesmo mutirão', async () => {
    vi.mocked(getMutiraoService).mockReturnValue({
      getMutiraoById: vi.fn().mockResolvedValue({
        success: true,
        data: { id: 'mut-1', organizer_id: 'organizer-1', status: 'completed' },
      }),
    } as any)
    const mintMutiraoBaseReward = vi.fn()
    const hasMutiraoRating = vi.fn().mockResolvedValue({ success: true, data: true })
    vi.mocked(getTekoinService).mockReturnValue({ mintMutiraoBaseReward, hasMutiraoRating } as any)

    const res = await rateOrganizerAction('mut-1', 5)

    expect(res.success).toBe(false)
    expect(mintMutiraoBaseReward).not.toHaveBeenCalled()
  })
})
