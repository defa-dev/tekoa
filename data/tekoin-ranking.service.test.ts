import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))

import { createClient } from '@/lib/supabase/server'
import { getTekoinRankingService } from './tekoin-ranking.service'

function makeChain(result: { data?: unknown; error?: unknown }) {
  const chain: any = {}
  ;['select', 'limit'].forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain)
  })
  chain.limit = vi.fn().mockResolvedValue(result)
  return chain
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TekoinRankingService.getCommunityRanking', () => {
  it('retorna o ranking mapeado pra camelCase', async () => {
    const chain = makeChain({
      data: [
        { community: 'Jardim das Acácias', total_earned: 42 },
        { community: 'Vila Nova', total_earned: 17 },
      ],
      error: null,
    })
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnValue(chain) } as any)

    const res = await getTekoinRankingService().getCommunityRanking(5)

    expect(res.success).toBe(true)
    expect(res.data).toEqual([
      { community: 'Jardim das Acácias', totalEarned: 42 },
      { community: 'Vila Nova', totalEarned: 17 },
    ])
    expect(chain.limit).toHaveBeenCalledWith(5)
  })

  it('propaga erro do banco', async () => {
    const chain = makeChain({ data: null, error: { message: 'falha', code: 'X' } })
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnValue(chain) } as any)

    const res = await getTekoinRankingService().getCommunityRanking()

    expect(res.success).toBe(false)
  })

  it('retorna a mesma instância (singleton)', () => {
    expect(getTekoinRankingService()).toBe(getTekoinRankingService())
  })
})
