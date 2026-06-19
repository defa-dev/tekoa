import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getBlogLinkService } from './blog-link.service'

const mockLink = {
  id: 'link-1',
  title: 'Teia dos Povos',
  source: 'Teia dos Povos',
  url: 'https://teiadospovos.org.br',
  note: 'Articulação de povos e comunidades tradicionais.',
  added_by: 'user-1',
  created_at: new Date().toISOString(),
}

function makeChain(result: { data?: unknown; error?: unknown }) {
  const chain: any = {}
  ;['select', 'insert', 'delete', 'eq', 'order'].forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain)
  })
  chain.single = vi.fn().mockResolvedValue(result)
  chain.then = (resolve: (value: typeof result) => void) => resolve(result)
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

describe('BlogLinkService.getLinks', () => {
  it('lista as indicações, mais recentes primeiro', async () => {
    const chain = makeChain({ data: [mockLink], error: null })
    mockServer(chain)

    const res = await getBlogLinkService().getLinks()

    expect(res.success).toBe(true)
    expect(res.data).toHaveLength(1)
  })
})

describe('BlogLinkService.createLink', () => {
  it('cria a indicação quando os campos são válidos', async () => {
    const chain = makeChain({ data: mockLink, error: null })
    mockAdmin(chain)

    const res = await getBlogLinkService().createLink('user-1', {
      title: 'Teia dos Povos',
      source: 'Teia dos Povos',
      url: 'https://teiadospovos.org.br',
      note: 'Vale a leitura.',
    })

    expect(res.success).toBe(true)
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ added_by: 'user-1', url: 'https://teiadospovos.org.br' })
    )
  })

  it('rejeita URL inválida', async () => {
    const res = await getBlogLinkService().createLink('user-1', {
      title: 'Algo',
      source: 'Fonte',
      url: 'não-é-uma-url',
    })
    expect(res.success).toBe(false)
  })

  it('rejeita campos obrigatórios vazios', async () => {
    const res = await getBlogLinkService().createLink('user-1', {
      title: '',
      source: 'Fonte',
      url: 'https://exemplo.com',
    })
    expect(res.success).toBe(false)
  })

  it('traduz violação de URL duplicada num erro amigável', async () => {
    const chain = makeChain({ data: null, error: { code: '23505', message: 'duplicate key' } })
    mockAdmin(chain)

    const res = await getBlogLinkService().createLink('user-1', {
      title: 'Teia dos Povos',
      source: 'Teia dos Povos',
      url: 'https://teiadospovos.org.br',
    })

    expect(res.success).toBe(false)
    if (res.success) return
    expect(res.error?.code).toBe('DUPLICATE_URL')
  })
})

describe('BlogLinkService.deleteLink', () => {
  it('remove a indicação', async () => {
    const chain = makeChain({ data: null, error: null })
    mockAdmin(chain)

    const res = await getBlogLinkService().deleteLink('link-1')

    expect(res.success).toBe(true)
    expect(chain.eq).toHaveBeenCalledWith('id', 'link-1')
  })
})

describe('getBlogLinkService singleton', () => {
  it('retorna a mesma instância', () => {
    expect(getBlogLinkService()).toBe(getBlogLinkService())
  })
})
