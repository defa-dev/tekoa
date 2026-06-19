import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))

import { createClient } from '@/lib/supabase/server'
import { MutiraoService, getMutiraoService } from './mutirao.service'

const mockMutirao = {
  id: 'mut-1',
  organizer_id: 'user-1',
  community_id: 'c-1',
  title: 'Limpar a quadra',
  description: 'Mutirão pra limpar a quadra do bairro',
  location: 'Quadra da rua X',
  scheduled_at: null,
  min_confirmations: 2,
  status: 'open' as const,
  created_at: new Date().toISOString(),
  completed_at: null,
}

function makeChain(result: { data?: unknown; error?: unknown; count?: number }) {
  const chain: any = {}
  ;['select', 'insert', 'update', 'eq', 'in', 'or', 'order', 'limit'].forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain)
  })
  chain.single = vi.fn().mockResolvedValue(result)
  chain.maybeSingle = vi.fn().mockResolvedValue(result)
  // Permite `await query` direto (sem `.single()`), como em `listOpenMutiroes`.
  chain.then = (resolve: (value: typeof result) => void) => resolve(result)
  return chain
}

function mockServer(chain: ReturnType<typeof makeChain>) {
  vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnValue(chain) } as any)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MutiraoService.createMutirao', () => {
  it('cria o mutirão com status open', async () => {
    const chain = makeChain({ data: mockMutirao, error: null })
    mockServer(chain)

    const svc = new MutiraoService()
    const res = await svc.createMutirao('user-1', {
      title: 'Limpar a quadra',
      description: 'Mutirão pra limpar a quadra do bairro',
      minConfirmations: 2,
    })

    expect(res.success).toBe(true)
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ organizer_id: 'user-1', status: 'open', min_confirmations: 2 })
    )
  })

  it('rejeita mínimo de confirmações menor que 1', async () => {
    const svc = new MutiraoService()
    const res = await svc.createMutirao('user-1', {
      title: 'Limpar a quadra',
      description: 'Mutirão pra limpar a quadra do bairro',
      minConfirmations: 0,
    })

    expect(res.success).toBe(false)
  })

  it('grava território (community/reach) quando informado', async () => {
    const chain = makeChain({ data: mockMutirao, error: null })
    mockServer(chain)

    const svc = new MutiraoService()
    await svc.createMutirao('user-1', {
      title: 'Limpar a quadra',
      description: 'Mutirão pra limpar a quadra do bairro',
      minConfirmations: 2,
      community: 'Massaguaçu',
      reach: 'own',
    })

    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ community: 'Massaguaçu', reach: 'own', reach_communities: [] })
    )
  })

  it('usa reach own por padrão quando não informado', async () => {
    const chain = makeChain({ data: mockMutirao, error: null })
    mockServer(chain)

    const svc = new MutiraoService()
    await svc.createMutirao('user-1', {
      title: 'Limpar a quadra',
      description: 'Mutirão pra limpar a quadra do bairro',
      minConfirmations: 2,
    })

    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ reach: 'own' }))
  })
})

describe('MutiraoService.listOpenMutiroes', () => {
  it('aplica o filtro de território quando viewerCommunity é informada', async () => {
    const chain = makeChain({ data: [mockMutirao], error: null })
    mockServer(chain)

    const svc = new MutiraoService()
    const res = await svc.listOpenMutiroes({ viewerCommunity: 'Massaguaçu' })

    expect(res.success).toBe(true)
    expect(chain.or).toHaveBeenCalledWith(
      expect.stringContaining('community.eq.Massaguaçu')
    )
  })

  it('não filtra por território quando allTerritories é true', async () => {
    const chain = makeChain({ data: [mockMutirao], error: null })
    mockServer(chain)

    const svc = new MutiraoService()
    const res = await svc.listOpenMutiroes({ viewerCommunity: 'Massaguaçu', allTerritories: true })

    expect(res.success).toBe(true)
    expect(chain.or).not.toHaveBeenCalled()
  })
})

describe('MutiraoService.confirmAttendance', () => {
  it('bloqueia o organizador de confirmar presença no próprio mutirão', async () => {
    const chain = makeChain({ data: mockMutirao, error: null })
    mockServer(chain)

    const svc = new MutiraoService()
    const res = await svc.confirmAttendance('mut-1', 'user-1')

    expect(res.success).toBe(false)
    if (res.success) return
    expect(res.error?.code).toBe('IS_ORGANIZER')
  })

  it('bloqueia confirmação em mutirão concluído', async () => {
    const chain = makeChain({ data: { ...mockMutirao, status: 'completed' }, error: null })
    mockServer(chain)

    const svc = new MutiraoService()
    const res = await svc.confirmAttendance('mut-1', 'user-2')

    expect(res.success).toBe(false)
  })

  it('confirma presença e atualiza status pra confirmed ao bater o mínimo', async () => {
    let call = 0
    const fromMock = vi.fn().mockImplementation((table: string) => {
      call += 1
      if (table === 'mutirao_requests' && call === 1) {
        return makeChain({ data: mockMutirao, error: null })
      }
      if (table === 'mutirao_confirmations' && call === 2) {
        return makeChain({ data: { id: 'conf-1', mutirao_id: 'mut-1', user_id: 'user-2' }, error: null })
      }
      if (table === 'mutirao_confirmations' && call === 3) {
        const chain = makeChain({ data: null, error: null, count: 2 })
        chain.select = vi.fn().mockReturnValue(chain)
        chain.eq = vi.fn().mockResolvedValue({ count: 2, error: null })
        return chain
      }
      return makeChain({ data: mockMutirao, error: null })
    })
    vi.mocked(createClient).mockResolvedValue({ from: fromMock } as any)

    const svc = new MutiraoService()
    const res = await svc.confirmAttendance('mut-1', 'user-2')

    expect(res.success).toBe(true)
  })
})

describe('MutiraoService.cancelMutirao', () => {
  it('bloqueia quem não é organizador', async () => {
    const chain = makeChain({ data: mockMutirao, error: null })
    mockServer(chain)

    const svc = new MutiraoService()
    const res = await svc.cancelMutirao('mut-1', 'user-99')

    expect(res.success).toBe(false)
  })
})

describe('MutiraoService.markAttendance', () => {
  it('bloqueia quem não é organizador', async () => {
    const chain = makeChain({ data: mockMutirao, error: null })
    mockServer(chain)

    const svc = new MutiraoService()
    const res = await svc.markAttendance('mut-1', 'user-99', [{ userId: 'user-2', attended: true }])

    expect(res.success).toBe(false)
  })

  it('marca presença e conclui o mutirão quando chamado pelo organizador', async () => {
    const chain = makeChain({ data: mockMutirao, error: null })
    mockServer(chain)

    const svc = new MutiraoService()
    const res = await svc.markAttendance('mut-1', 'user-1', [{ userId: 'user-2', attended: true }])

    expect(res.success).toBe(true)
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'completed' })
    )
  })
})

describe('getMutiraoService singleton', () => {
  it('retorna a mesma instância', () => {
    expect(getMutiraoService()).toBe(getMutiraoService())
  })
})
