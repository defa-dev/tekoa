import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TekoinService, getTekoinService } from './tekoin.service'

const mockTx = {
  id: 'tx-1',
  user_id: 'user-1',
  counterparty_id: 'user-2',
  amount: 10,
  type: 'earned_rating' as const,
  reference_type: 'trade' as const,
  reference_id: 'trade-1',
  created_at: new Date().toISOString(),
}

function makeChain(result: { data?: unknown; error?: unknown; count?: number }) {
  const chain: any = {}
  ;['select', 'insert', 'eq', 'gte', 'gt', 'in', 'order', 'range', 'limit'].forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain)
  })
  chain['single'] = vi.fn().mockResolvedValue(result)
  return chain
}

function mockServer(chain: ReturnType<typeof makeChain>) {
  vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnValue(chain) } as any)
}

function mockAdmin(chain: ReturnType<typeof makeChain>) {
  vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnValue(chain) } as any)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TekoinService.mintRatingReward', () => {
  it('credita Tekoin pra avaliação de 5 estrelas', async () => {
    const chain = makeChain({ data: mockTx, error: null })
    mockAdmin(chain)

    const svc = new TekoinService()
    const res = await svc.mintRatingReward('user-1', 'user-2', 5, 'trade-1')

    expect(res.success).toBe(true)
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', counterparty_id: 'user-2', amount: 10, type: 'earned_rating' })
    )
  })

  it('não grava transação pra avaliação de 1 estrela (vale 0)', async () => {
    const chain = makeChain({ data: null, error: null })
    mockAdmin(chain)

    const svc = new TekoinService()
    const res = await svc.mintRatingReward('user-1', 'user-2', 1, 'trade-1')

    expect(res.success).toBe(true)
    expect(res.data).toBeNull()
    expect(chain.insert).not.toHaveBeenCalled()
  })

  it('usa reference_type null quando não há trade resolvido', async () => {
    const chain = makeChain({ data: mockTx, error: null })
    mockAdmin(chain)

    const svc = new TekoinService()
    await svc.mintRatingReward('user-1', 'user-2', 4, null)

    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ reference_type: null, reference_id: null })
    )
  })
})

describe('TekoinService.mintMutiraoBaseReward', () => {
  it('credita Tekoin base pra quem participou, escalado pela nota', async () => {
    const chain = makeChain({ data: mockTx, error: null })
    mockAdmin(chain)

    const svc = new TekoinService()
    const res = await svc.mintMutiraoBaseReward('user-2', 'organizer-1', 5, 'mut-1')

    expect(res.success).toBe(true)
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-2',
        counterparty_id: 'organizer-1',
        amount: 10,
        type: 'earned_mutirao_base',
        reference_type: 'mutirao',
        reference_id: 'mut-1',
      })
    )
  })

  it('não grava nada pra nota que vale 0', async () => {
    const chain = makeChain({ data: null, error: null })
    mockAdmin(chain)

    const svc = new TekoinService()
    const res = await svc.mintMutiraoBaseReward('user-2', 'organizer-1', 1, 'mut-1')

    expect(res.success).toBe(true)
    expect(res.data).toBeNull()
    expect(chain.insert).not.toHaveBeenCalled()
  })
})

describe('TekoinService.creditMutiraoExtra', () => {
  it('credita um valor plano vindo do fundo comunitário', async () => {
    const chain = makeChain({ data: mockTx, error: null })
    mockAdmin(chain)

    const svc = new TekoinService()
    const res = await svc.creditMutiraoExtra('user-2', 7, 'mut-1')

    expect(res.success).toBe(true)
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-2', amount: 7, type: 'earned_mutirao_base' })
    )
  })

  it('não credita valores zero ou negativos', async () => {
    const chain = makeChain({ data: null, error: null })
    mockAdmin(chain)

    const svc = new TekoinService()
    const res = await svc.creditMutiraoExtra('user-2', 0, 'mut-1')

    expect(res.success).toBe(true)
    expect(res.data).toBeNull()
    expect(chain.insert).not.toHaveBeenCalled()
  })
})

describe('TekoinService.hasMutiraoRating', () => {
  it('retorna true quando já existe a transação dessa direção', async () => {
    const chain = makeChain({ data: { id: 'tx-1' }, error: null })
    chain['maybeSingle'] = vi.fn().mockResolvedValue({ data: { id: 'tx-1' }, error: null })
    mockServer(chain)

    const svc = new TekoinService()
    const res = await svc.hasMutiraoRating('mut-1', 'organizer-1', 'user-2')

    expect(res.success).toBe(true)
    expect(res.data).toBe(true)
  })

  it('retorna false quando não há transação', async () => {
    const chain = makeChain({ data: null, error: null })
    chain['maybeSingle'] = vi.fn().mockResolvedValue({ data: null, error: null })
    mockServer(chain)

    const svc = new TekoinService()
    const res = await svc.hasMutiraoRating('mut-1', 'organizer-1', 'user-2')

    expect(res.success).toBe(true)
    expect(res.data).toBe(false)
  })
})

describe('TekoinService.mintAvisoReward', () => {
  it('credita Tekoin quando ainda não bateu o cap diário', async () => {
    const chain = makeChain({ data: mockTx, error: null })
    chain['gte'] = vi.fn().mockResolvedValue({ count: 0, error: null })
    mockAdmin(chain)

    const svc = new TekoinService()
    const res = await svc.mintAvisoReward('user-1', 'aviso-1')

    expect(res.success).toBe(true)
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', type: 'earned_aviso', amount: 1 })
    )
  })

  it('não credita quando já bateu o cap diário', async () => {
    const chain = makeChain({ data: null, error: null, count: 2 })
    chain['gte'] = vi.fn().mockResolvedValue({ count: 2, error: null })
    mockAdmin(chain)

    const svc = new TekoinService()
    const res = await svc.mintAvisoReward('user-1', 'aviso-1')

    expect(res.success).toBe(true)
    expect(res.data).toBeNull()
    expect(chain.insert).not.toHaveBeenCalled()
  })
})

describe('TekoinService.getBalance', () => {
  it('retorna o saldo do usuário', async () => {
    const chain = makeChain({ data: { tekoin_balance: 42 }, error: null })
    mockServer(chain)

    const svc = new TekoinService()
    const res = await svc.getBalance('user-1')

    expect(res.success).toBe(true)
    expect(res.data).toBe(42)
  })

  it('retorna 0 se não encontrar o usuário', async () => {
    const chain = makeChain({ data: null, error: null })
    mockServer(chain)

    const svc = new TekoinService()
    const res = await svc.getBalance('user-1')

    expect(res.success).toBe(true)
    expect(res.data).toBe(0)
  })
})

describe('TekoinService.getLedger', () => {
  it('retorna o extrato do usuário', async () => {
    const chain = makeChain({ data: [mockTx], error: null })
    chain['range'] = vi.fn().mockResolvedValue({ data: [mockTx], error: null })
    mockServer(chain)

    const svc = new TekoinService()
    const res = await svc.getLedger('user-1')

    expect(res.success).toBe(true)
    expect(res.data).toHaveLength(1)
  })
})

describe('TekoinService.spendOnBoost', () => {
  it('debita o custo e cria o boost quando há saldo suficiente', async () => {
    const balanceChain = makeChain({ data: { tekoin_balance: 100 }, error: null })
    mockServer(balanceChain)
    const adminChain = makeChain({ data: mockTx, error: null })
    mockAdmin(adminChain)

    const svc = new TekoinService()
    const res = await svc.spendOnBoost('user-1', 'highlight', { serviceId: 'svc-1' })

    expect(res.success).toBe(true)
    expect(adminChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', service_id: 'svc-1', kind: 'highlight' })
    )
    expect(adminChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ amount: -15, type: 'spent_highlight', reference_type: 'service' })
    )
  })

  it('bloqueia quando o saldo é insuficiente', async () => {
    const balanceChain = makeChain({ data: { tekoin_balance: 5 }, error: null })
    mockServer(balanceChain)
    const adminChain = makeChain({ data: mockTx, error: null })
    mockAdmin(adminChain)

    const svc = new TekoinService()
    const res = await svc.spendOnBoost('user-1', 'highlight', { serviceId: 'svc-1' })

    expect(res.success).toBe(false)
    expect(adminChain.insert).not.toHaveBeenCalled()
  })
})

describe('TekoinService.getActiveBoostedIds', () => {
  it('retorna o conjunto de ids com boost ativo', async () => {
    const chain = makeChain({ data: null, error: null })
    chain['gt'] = vi.fn().mockResolvedValue({ data: [{ service_id: 'svc-1' }], error: null })
    mockServer(chain)

    const svc = new TekoinService()
    const res = await svc.getActiveBoostedIds('highlight', 'service_id', ['svc-1', 'svc-2'])

    expect(res.success).toBe(true)
    expect(res.data!.has('svc-1')).toBe(true)
    expect(res.data!.has('svc-2')).toBe(false)
  })

  it('retorna conjunto vazio sem consultar quando não há ids', async () => {
    const svc = new TekoinService()
    const res = await svc.getActiveBoostedIds('priority', 'product_id', [])
    expect(res.success).toBe(true)
    expect(res.data!.size).toBe(0)
  })
})

describe('TekoinService.sortByActiveBoost', () => {
  it('traz itens destacados/priorizados pro topo preservando ordem relativa', async () => {
    const chain = makeChain({ data: null, error: null })
    chain['gt'] = vi.fn().mockResolvedValue({ data: [{ service_id: 'b' }], error: null })
    mockServer(chain)

    const svc = new TekoinService()
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const sorted = await svc.sortByActiveBoost(items, 'service_id')

    expect(sorted.map((i) => i.id)).toEqual(['b', 'a', 'c'])
  })

  it('mantém a ordem original quando não há boosts ativos', async () => {
    const chain = makeChain({ data: null, error: null })
    chain['gt'] = vi.fn().mockResolvedValue({ data: [], error: null })
    mockServer(chain)

    const svc = new TekoinService()
    const items = [{ id: 'a' }, { id: 'b' }]
    const sorted = await svc.sortByActiveBoost(items, 'product_id')

    expect(sorted.map((i) => i.id)).toEqual(['a', 'b'])
  })
})

describe('TekoinService.checkAndAwardBadges', () => {
  it('concede badges cujo marco já foi atingido', async () => {
    const balanceChain = makeChain({ data: { tekoin_balance: 30 }, error: null })
    mockServer(balanceChain)
    const adminChain = makeChain({ data: { id: 'badge-1' }, error: null })
    mockAdmin(adminChain)

    const svc = new TekoinService()
    const res = await svc.checkAndAwardBadges('user-1')

    expect(res.success).toBe(true)
    if (!res.success) return
    expect(res.data).toEqual(['tekoin_25'])
    expect(adminChain.insert).toHaveBeenCalledWith({ user_id: 'user-1', badge_code: 'tekoin_25' })
  })

  it('não concede nada se nenhum marco foi atingido', async () => {
    const balanceChain = makeChain({ data: { tekoin_balance: 5 }, error: null })
    mockServer(balanceChain)
    const adminChain = makeChain({ data: null, error: null })
    mockAdmin(adminChain)

    const svc = new TekoinService()
    const res = await svc.checkAndAwardBadges('user-1')

    expect(res.success).toBe(true)
    if (res.success) expect(res.data).toHaveLength(0)
    expect(adminChain.insert).not.toHaveBeenCalled()
  })
})

describe('TekoinService.getUserBadges', () => {
  it('retorna os badges do usuário', async () => {
    const chain = makeChain({ data: [{ id: 'badge-1', badge_code: 'tekoin_25' }], error: null })
    chain['order'] = vi.fn().mockResolvedValue({ data: [{ id: 'badge-1', badge_code: 'tekoin_25' }], error: null })
    mockServer(chain)

    const svc = new TekoinService()
    const res = await svc.getUserBadges('user-1')

    expect(res.success).toBe(true)
    if (res.success) expect(res.data).toHaveLength(1)
  })
})

describe('getTekoinService singleton', () => {
  it('retorna a mesma instância', () => {
    expect(getTekoinService()).toBe(getTekoinService())
  })
})
