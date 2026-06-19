import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./mutirao.service', () => ({ getMutiraoService: vi.fn() }))
vi.mock('./tekoin.service', () => ({ getTekoinService: vi.fn() }))
vi.mock('./community-admin.service', () => ({ getCommunityAdminService: vi.fn() }))
vi.mock('./community-fund.service', () => ({ getCommunityFundService: vi.fn() }))

import { getMutiraoService } from './mutirao.service'
import { getTekoinService } from './tekoin.service'
import { getCommunityAdminService } from './community-admin.service'
import { getCommunityFundService } from './community-fund.service'
import { getMutiraoPayoutService } from './mutirao-payout.service'

const mockMutirao = {
  id: 'mut-1',
  organizer_id: 'organizer-1',
  community_id: 'c-1',
  status: 'confirmed',
}

function baseMocks(overrides?: { isAdmin?: boolean; fundAvailable?: number }) {
  vi.mocked(getMutiraoService).mockReturnValue({
    getMutiraoById: vi.fn().mockResolvedValue({ success: true, data: mockMutirao }),
    markAttendance: vi.fn().mockResolvedValue({ success: true }),
  } as any)

  const mintMutiraoBaseReward = vi
    .fn()
    .mockResolvedValue({ success: true, data: { amount: 10 } })
  const creditMutiraoExtra = vi.fn().mockResolvedValue({ success: true, data: null })
  vi.mocked(getTekoinService).mockReturnValue({ mintMutiraoBaseReward, creditMutiraoExtra } as any)

  vi.mocked(getCommunityAdminService).mockReturnValue({
    isCommunityAdmin: vi.fn().mockResolvedValue(overrides?.isAdmin ?? false),
  } as any)

  vi.mocked(getCommunityFundService).mockReturnValue({
    debitIfAvailable: vi
      .fn()
      .mockResolvedValue({ success: true, data: overrides?.fundAvailable ?? 0 }),
  } as any)

  return { mintMutiraoBaseReward, creditMutiraoExtra }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MutiraoPayoutService.closeMutirao', () => {
  it('minta a recompensa base só pra quem esteve presente', async () => {
    const { mintMutiraoBaseReward } = baseMocks()

    const res = await getMutiraoPayoutService().closeMutirao('mut-1', 'organizer-1', [
      { userId: 'user-2', attended: true, rating: 5 },
      { userId: 'user-3', attended: false, rating: 1 },
    ])

    expect(res.success).toBe(true)
    expect(mintMutiraoBaseReward).toHaveBeenCalledTimes(1)
    expect(mintMutiraoBaseReward).toHaveBeenCalledWith('user-2', 'organizer-1', 5, 'mut-1')
  })

  it('não distribui extra quando o organizador não é admin da comunidade', async () => {
    const { creditMutiraoExtra } = baseMocks({ isAdmin: false })

    const res = await getMutiraoPayoutService().closeMutirao(
      'mut-1',
      'organizer-1',
      [{ userId: 'user-2', attended: true, rating: 5 }],
      20
    )

    expect(res.success).toBe(true)
    if (res.success) expect(res.data!.extraDistributed).toBe(0)
    expect(creditMutiraoExtra).not.toHaveBeenCalled()
  })

  it('distribui o extra disponível do fundo quando o organizador é admin', async () => {
    const { creditMutiraoExtra } = baseMocks({ isAdmin: true, fundAvailable: 20 })

    const res = await getMutiraoPayoutService().closeMutirao(
      'mut-1',
      'organizer-1',
      [
        { userId: 'user-2', attended: true, rating: 5 },
        { userId: 'user-3', attended: true, rating: 4 },
      ],
      20
    )

    expect(res.success).toBe(true)
    if (res.success) expect(res.data!.extraDistributed).toBe(20)
    expect(creditMutiraoExtra).toHaveBeenCalledWith('user-2', 10, 'mut-1')
    expect(creditMutiraoExtra).toHaveBeenCalledWith('user-3', 10, 'mut-1')
  })

  it('nunca bloqueia o fechamento quando o fundo está sem saldo', async () => {
    const { creditMutiraoExtra } = baseMocks({ isAdmin: true, fundAvailable: 0 })

    const res = await getMutiraoPayoutService().closeMutirao(
      'mut-1',
      'organizer-1',
      [{ userId: 'user-2', attended: true, rating: 5 }],
      50
    )

    expect(res.success).toBe(true)
    if (res.success) expect(res.data!.extraDistributed).toBe(0)
    expect(creditMutiraoExtra).not.toHaveBeenCalled()
  })

  it('bloqueia fechar de novo um mutirão já concluído', async () => {
    const { mintMutiraoBaseReward } = baseMocks()
    vi.mocked(getMutiraoService).mockReturnValue({
      getMutiraoById: vi
        .fn()
        .mockResolvedValue({ success: true, data: { ...mockMutirao, status: 'completed' } }),
      markAttendance: vi.fn().mockResolvedValue({ success: true }),
    } as any)

    const res = await getMutiraoPayoutService().closeMutirao('mut-1', 'organizer-1', [
      { userId: 'user-2', attended: true, rating: 5 },
    ])

    expect(res.success).toBe(false)
    expect(mintMutiraoBaseReward).not.toHaveBeenCalled()
  })
})
