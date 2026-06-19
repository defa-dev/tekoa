import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCommunityAdminService } from './community-admin.service'

function makeChain(result: { data?: unknown; error?: unknown }) {
  const chain: any = {}
  ;['select', 'upsert', 'eq', 'limit'].forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain)
  })
  chain.single = vi.fn().mockResolvedValue(result)
  chain.maybeSingle = vi.fn().mockResolvedValue(result)
  return chain
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CommunityAdminService.assignAdmin', () => {
  it('grava o admin via upsert', async () => {
    const chain = makeChain({ data: { id: 'ca-1', community_id: 'c-1', user_id: 'u-1' }, error: null })
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnValue(chain) } as any)

    const res = await getCommunityAdminService().assignAdmin('c-1', 'u-1', 'admin-1')

    expect(res.success).toBe(true)
    expect(chain.upsert).toHaveBeenCalledWith(
      { community_id: 'c-1', user_id: 'u-1', assigned_by: 'admin-1' },
      { onConflict: 'community_id,user_id' }
    )
  })
})

describe('CommunityAdminService.getAdminForCommunity', () => {
  it('retorna o admin explícito quando existe', async () => {
    const adminsChain = makeChain({ data: { user_id: 'u-1' }, error: null })
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnValue(adminsChain) } as any)

    const res = await getCommunityAdminService().getAdminForCommunity('c-1')

    expect(res.success).toBe(true)
    expect(res.data).toBe('u-1')
  })

  it('cai pro criador da comunidade quando não há admin explícito', async () => {
    let call = 0
    const fromMock = vi.fn().mockImplementation(() => {
      call += 1
      if (call === 1) return makeChain({ data: null, error: null })
      return makeChain({ data: { created_by: 'creator-1' }, error: null })
    })
    vi.mocked(createClient).mockResolvedValue({ from: fromMock } as any)

    const res = await getCommunityAdminService().getAdminForCommunity('c-1')

    expect(res.success).toBe(true)
    expect(res.data).toBe('creator-1')
  })
})

describe('CommunityAdminService.isCommunityAdmin', () => {
  it('retorna true quando o usuário é o admin', async () => {
    const chain = makeChain({ data: { user_id: 'u-1' }, error: null })
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnValue(chain) } as any)

    expect(await getCommunityAdminService().isCommunityAdmin('c-1', 'u-1')).toBe(true)
  })

  it('retorna false quando o usuário não é o admin', async () => {
    const chain = makeChain({ data: { user_id: 'u-1' }, error: null })
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnValue(chain) } as any)

    expect(await getCommunityAdminService().isCommunityAdmin('c-1', 'u-2')).toBe(false)
  })
})
