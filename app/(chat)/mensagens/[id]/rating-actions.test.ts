import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth/session', () => ({ getAuthUser: vi.fn() }))
vi.mock('@/data/rating.service', () => ({ getRatingService: vi.fn() }))
vi.mock('@/data/trade.service', () => ({ getTradeService: vi.fn() }))
vi.mock('@/data/tekoin.service', () => ({ getTekoinService: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { getAuthUser } from '@/lib/auth/session'
import { getRatingService } from '@/data/rating.service'
import { getTradeService } from '@/data/trade.service'
import { getTekoinService } from '@/data/tekoin.service'
import { rateUserAction } from './rating-actions'

const mockUser = { id: 'user-1', email: 'u1@test.com' }
const mockRating = { id: 'rating-1', to_user_id: 'user-2', rating: 5 }
const mockTrade = { id: 'trade-1', chat_id: 'chat-1' }

function setupMocks(opts?: { createRatingSuccess?: boolean; tradeFound?: boolean }) {
  const createRating = vi.fn().mockResolvedValue(
    opts?.createRatingSuccess === false
      ? { success: false, error: { message: 'Você já avaliou esta negociação' } }
      : { success: true, data: mockRating }
  )
  vi.mocked(getRatingService).mockReturnValue({ createRating } as any)

  const getTradeByChat = vi.fn().mockResolvedValue(
    opts?.tradeFound === false ? { success: true, data: null } : { success: true, data: mockTrade }
  )
  vi.mocked(getTradeService).mockReturnValue({ getTradeByChat } as any)

  const mintRatingReward = vi.fn().mockResolvedValue({ success: true, data: null })
  const checkAndAwardBadges = vi.fn().mockResolvedValue({ success: true, data: [] })
  vi.mocked(getTekoinService).mockReturnValue({ mintRatingReward, checkAndAwardBadges } as any)

  return { createRating, getTradeByChat, mintRatingReward, checkAndAwardBadges }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getAuthUser).mockResolvedValue(mockUser as any)
})

describe('rateUserAction', () => {
  it('retorna erro se não autenticado', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null)
    const res = await rateUserAction({ toUserId: 'user-2', rating: 5 })
    expect(res.success).toBe(false)
  })

  it('bloqueia autoavaliação', async () => {
    setupMocks()
    const res = await rateUserAction({ toUserId: 'user-1', rating: 5 })
    expect(res.success).toBe(false)
  })

  it('cria a avaliação e credita Tekoin resolvendo o trade pelo chatId', async () => {
    const { createRating, getTradeByChat, mintRatingReward } = setupMocks()

    const res = await rateUserAction({ chatId: 'chat-1', toUserId: 'user-2', rating: 5, serviceId: 'svc-1' })

    expect(res.success).toBe(true)
    expect(createRating).toHaveBeenCalledWith('user-1', expect.objectContaining({ to_user_id: 'user-2', rating: 5 }))
    expect(getTradeByChat).toHaveBeenCalledWith('chat-1')
    expect(mintRatingReward).toHaveBeenCalledWith('user-2', 'user-1', 5, 'trade-1')
  })

  it('credita Tekoin com reference_id null quando não há chatId', async () => {
    const { mintRatingReward, getTradeByChat } = setupMocks()

    await rateUserAction({ toUserId: 'user-2', rating: 4 })

    expect(getTradeByChat).not.toHaveBeenCalled()
    expect(mintRatingReward).toHaveBeenCalledWith('user-2', 'user-1', 4, null)
  })

  it('não falha a action se a mineração de Tekoin der erro', async () => {
    const { mintRatingReward } = setupMocks()
    mintRatingReward.mockRejectedValue(new Error('boom'))

    const res = await rateUserAction({ chatId: 'chat-1', toUserId: 'user-2', rating: 5 })

    expect(res.success).toBe(true)
  })

  it('propaga erro se a avaliação já existe', async () => {
    setupMocks({ createRatingSuccess: false })
    const res = await rateUserAction({ toUserId: 'user-2', rating: 5 })
    expect(res.success).toBe(false)
  })
})
