import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth/session', () => ({ getAuthUser: vi.fn() }))
vi.mock('@/data/tekoin.service', () => ({ getTekoinService: vi.fn() }))
vi.mock('@/data/trade.service', () => ({ getTradeService: vi.fn() }))
vi.mock('@/data/rating.service', () => ({ getRatingService: vi.fn() }))
vi.mock('@/data/user.service', () => ({ getUserService: vi.fn() }))

import { getAuthUser } from '@/lib/auth/session'
import { getTekoinService } from '@/data/tekoin.service'
import { getTradeService } from '@/data/trade.service'
import { getRatingService } from '@/data/rating.service'
import { getUserService } from '@/data/user.service'
import { getMyTekoinLedgerAction, getPendingRatingsAction } from './tekoin-actions'

const mockUser = { id: 'user-1', email: 'u1@test.com' }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getAuthUser).mockResolvedValue(mockUser as any)
})

describe('getMyTekoinLedgerAction', () => {
  it('retorna erro se não autenticado', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null)
    const res = await getMyTekoinLedgerAction()
    expect(res.success).toBe(false)
  })

  it('retorna o extrato do usuário', async () => {
    const getLedger = vi.fn().mockResolvedValue({ success: true, data: [{ id: 'tx-1' }] })
    vi.mocked(getTekoinService).mockReturnValue({ getLedger } as any)

    const res = await getMyTekoinLedgerAction()

    expect(res.success).toBe(true)
    if (res.success) expect(res.data).toHaveLength(1)
    expect(getLedger).toHaveBeenCalledWith('user-1', 20, 0)
  })
})

describe('getPendingRatingsAction', () => {
  it('retorna erro se não autenticado', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null)
    const res = await getPendingRatingsAction()
    expect(res.success).toBe(false)
  })

  it('lista trocas concluídas ainda não avaliadas pelo usuário', async () => {
    const trades = [
      {
        id: 'trade-1',
        chat_id: 'chat-1',
        service_id: 'svc-1',
        product_id: null,
        outcome: 'completed',
        closed_at: new Date().toISOString(),
        otherParticipantId: 'user-2',
      },
      {
        id: 'trade-2',
        chat_id: 'chat-2',
        service_id: 'svc-2',
        product_id: null,
        outcome: 'completed',
        closed_at: new Date().toISOString(),
        otherParticipantId: 'user-3',
      },
    ]
    vi.mocked(getTradeService).mockReturnValue({
      getUserTrades: vi.fn().mockResolvedValue({ success: true, data: trades }),
    } as any)
    vi.mocked(getRatingService).mockReturnValue({
      hasRatedService: vi
        .fn()
        .mockImplementation((_userId: string, serviceId: string) =>
          Promise.resolve({ success: true, data: serviceId === 'svc-2' })
        ),
      hasRatedProduct: vi.fn().mockResolvedValue({ success: true, data: false }),
    } as any)
    vi.mocked(getUserService).mockReturnValue({
      getUsersByIds: vi
        .fn()
        .mockResolvedValue({ success: true, data: [{ id: 'user-2', full_name: 'Maria' }] }),
    } as any)

    const res = await getPendingRatingsAction()

    expect(res.success).toBe(true)
    if (!res.success) return
    expect(res.data).toHaveLength(1)
    expect(res.data[0]).toMatchObject({ chatId: 'chat-1', otherUserId: 'user-2', otherUserName: 'Maria' })
  })

  it('retorna lista vazia quando tudo já foi avaliado', async () => {
    vi.mocked(getTradeService).mockReturnValue({
      getUserTrades: vi.fn().mockResolvedValue({ success: true, data: [] }),
    } as any)

    const res = await getPendingRatingsAction()

    expect(res.success).toBe(true)
    if (res.success) expect(res.data).toHaveLength(0)
  })
})
