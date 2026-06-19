import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TradeService, getTradeService } from './trade.service'

const mockTrade = {
  id: 'trade-1',
  chat_id: 'chat-1',
  service_id: 'svc-1',
  product_id: null,
  participant_1: 'user-1',
  participant_2: 'user-2',
  closed_by: 'user-1',
  outcome: 'completed' as const,
  closed_at: new Date().toISOString(),
}

function makeChain(result: { data?: unknown; error?: unknown; count?: number }) {
  const chain: any = {}
  ;['select', 'insert', 'eq', 'or', 'in', 'order'].forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain)
  })
  chain['maybeSingle'] = vi.fn().mockResolvedValue(result)
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

describe('TradeService.createTrade', () => {
  it('insere o registro via admin client', async () => {
    const chain = makeChain({ data: mockTrade, error: null })
    mockAdmin(chain)

    const svc = new TradeService()
    const res = await svc.createTrade({
      chat_id: 'chat-1',
      service_id: 'svc-1',
      participant_1: 'user-1',
      participant_2: 'user-2',
      closed_by: 'user-1',
      outcome: 'completed',
    })

    expect(res.success).toBe(true)
    if (!res.success) return
    expect(res.data!.id).toBe('trade-1')
    expect(res.data!.outcome).toBe('completed')
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: 'completed', chat_id: 'chat-1' })
    )
  })

  it('insere com product_id quando é negociação de produto', async () => {
    const productTrade = { ...mockTrade, service_id: null, product_id: 'prod-1' }
    const chain = makeChain({ data: productTrade, error: null })
    mockAdmin(chain)

    const svc = new TradeService()
    const res = await svc.createTrade({
      chat_id: 'chat-1',
      product_id: 'prod-1',
      participant_1: 'user-1',
      participant_2: 'user-2',
      closed_by: 'user-1',
      outcome: 'completed',
    })

    expect(res.success).toBe(true)
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ product_id: 'prod-1', service_id: null })
    )
  })

  it('propaga erro do banco', async () => {
    const chain = makeChain({ data: null, error: { message: 'unique violation', code: '23505' } })
    mockAdmin(chain)

    const svc = new TradeService()
    const res = await svc.createTrade({
      chat_id: 'chat-1',
      service_id: 'svc-1',
      participant_1: 'user-1',
      participant_2: 'user-2',
      closed_by: 'user-1',
      outcome: 'completed',
    })

    expect(res.success).toBe(false)
  })
})

describe('TradeService.getUserTrades', () => {
  it('retorna trocas do usuário com otherParticipantId', async () => {
    const chain = makeChain({ data: [mockTrade], error: null })
    chain['order'] = vi.fn().mockResolvedValue({ data: [mockTrade], error: null })
    mockServer(chain)

    const svc = new TradeService()
    const res = await svc.getUserTrades('user-1')

    expect(res.success).toBe(true)
    if (!res.success) return
    expect(res.data![0].otherParticipantId).toBe('user-2')
  })

  it('retorna lista vazia se não há trocas', async () => {
    const chain = makeChain({ data: [], error: null })
    chain['order'] = vi.fn().mockResolvedValue({ data: [], error: null })
    mockServer(chain)

    const svc = new TradeService()
    const res = await svc.getUserTrades('user-1')

    expect(res.success).toBe(true)
    if (!res.success) return
    expect(res.data).toHaveLength(0)
  })
})

describe('TradeService.getTradeByChat', () => {
  it('retorna trade do chat', async () => {
    const chain = makeChain({ data: mockTrade, error: null })
    mockServer(chain)

    const svc = new TradeService()
    const res = await svc.getTradeByChat('chat-1')

    expect(res.success).toBe(true)
    if (!res.success) return
    expect(res.data?.id).toBe('trade-1')
  })

  it('retorna null se não há trade para o chat', async () => {
    const chain = makeChain({ data: null, error: null })
    mockServer(chain)

    const svc = new TradeService()
    const res = await svc.getTradeByChat('chat-99')

    expect(res.success).toBe(true)
    if (!res.success) return
    expect(res.data).toBeNull()
  })
})

describe('TradeService.getCompletedTradeCount', () => {
  it('conta trocas concluídas', async () => {
    const chain = makeChain({ data: null, error: null, count: 7 })
    chain['in'] = vi.fn().mockResolvedValue({ count: 7, error: null })
    mockServer(chain)

    const svc = new TradeService()
    const res = await svc.getCompletedTradeCount('user-1')

    expect(res.success).toBe(true)
    if (!res.success) return
    expect(res.data).toBe(7)
  })
})

describe('getTradeService singleton', () => {
  it('retorna a mesma instância', () => {
    const a = getTradeService()
    const b = getTradeService()
    expect(a).toBe(b)
  })
})
