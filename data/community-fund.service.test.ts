import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCommunityFundService } from './community-fund.service'

function makeChain(result: { data?: unknown; error?: unknown }) {
  const chain: any = {}
  ;['select', 'insert', 'eq'].forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain)
  })
  chain.maybeSingle = vi.fn().mockResolvedValue(result)
  return chain
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CommunityFundService.getBalance', () => {
  it('retorna o saldo do fundo', async () => {
    const chain = makeChain({ data: { balance: 50 }, error: null })
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnValue(chain) } as any)

    const res = await getCommunityFundService().getBalance('c-1')

    expect(res.success).toBe(true)
    expect(res.data).toBe(50)
  })

  it('retorna 0 se o fundo nunca recebeu transação', async () => {
    const chain = makeChain({ data: null, error: null })
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnValue(chain) } as any)

    const res = await getCommunityFundService().getBalance('c-1')

    expect(res.success).toBe(true)
    expect(res.data).toBe(0)
  })
})

describe('CommunityFundService.debitIfAvailable', () => {
  it('debita o valor total quando há saldo suficiente', async () => {
    const balanceChain = makeChain({ data: { balance: 100 }, error: null })
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnValue(balanceChain) } as any)
    const adminChain = makeChain({ data: null, error: null })
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnValue(adminChain) } as any)

    const res = await getCommunityFundService().debitIfAvailable('c-1', 30, 'mutirao_extra', 'm-1')

    expect(res.success).toBe(true)
    expect(res.data).toBe(30)
    expect(adminChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ community_id: 'c-1', amount: -30, type: 'mutirao_extra' })
    )
  })

  it('debita só o disponível quando o saldo é menor que o pedido', async () => {
    const balanceChain = makeChain({ data: { balance: 10 }, error: null })
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnValue(balanceChain) } as any)
    const adminChain = makeChain({ data: null, error: null })
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnValue(adminChain) } as any)

    const res = await getCommunityFundService().debitIfAvailable('c-1', 30, 'mutirao_extra')

    expect(res.success).toBe(true)
    expect(res.data).toBe(10)
  })

  it('não debita nada (e não falha) quando o saldo é zero', async () => {
    const balanceChain = makeChain({ data: { balance: 0 }, error: null })
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnValue(balanceChain) } as any)
    const adminChain = makeChain({ data: null, error: null })
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnValue(adminChain) } as any)

    const res = await getCommunityFundService().debitIfAvailable('c-1', 30, 'mutirao_extra')

    expect(res.success).toBe(true)
    expect(res.data).toBe(0)
    expect(adminChain.insert).not.toHaveBeenCalled()
  })
})

describe('CommunityFundService.credit', () => {
  it('grava um aporte no fundo', async () => {
    const adminChain = makeChain({ data: null, error: null })
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnValue(adminChain) } as any)

    const res = await getCommunityFundService().credit('c-1', 100, 'admin_topup')

    expect(res.success).toBe(true)
    expect(adminChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ community_id: 'c-1', amount: 100, type: 'admin_topup' })
    )
  })
})
