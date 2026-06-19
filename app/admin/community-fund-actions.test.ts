import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth/admin', () => ({ ensureAdmin: vi.fn() }))
vi.mock('@/data/community-fund.service', () => ({ getCommunityFundService: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { ensureAdmin } from '@/lib/auth/admin'
import { getCommunityFundService } from '@/data/community-fund.service'
import { topUpCommunityFundAction } from './community-fund-actions'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('topUpCommunityFundAction', () => {
  it('bloqueia quem não é admin da plataforma', async () => {
    vi.mocked(ensureAdmin).mockResolvedValue(false)
    const res = await topUpCommunityFundAction('c-1', 50)
    expect(res.success).toBe(false)
  })

  it('rejeita valores inválidos', async () => {
    vi.mocked(ensureAdmin).mockResolvedValue(true)
    const res = await topUpCommunityFundAction('c-1', 0)
    expect(res.success).toBe(false)
  })

  it('credita o fundo quando tudo é válido', async () => {
    vi.mocked(ensureAdmin).mockResolvedValue(true)
    const credit = vi.fn().mockResolvedValue({ success: true })
    vi.mocked(getCommunityFundService).mockReturnValue({ credit } as any)

    const res = await topUpCommunityFundAction('c-1', 50)

    expect(res.success).toBe(true)
    expect(credit).toHaveBeenCalledWith('c-1', 50, 'admin_topup')
  })
})
