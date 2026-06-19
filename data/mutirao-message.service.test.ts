import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))

import { createClient } from '@/lib/supabase/server'
import { getMutiraoMessageService } from './mutirao-message.service'

function makeChain(result: { data?: unknown; error?: unknown }) {
  const chain: any = {}
  ;['select', 'insert', 'eq', 'order'].forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain)
  })
  chain.single = vi.fn().mockResolvedValue(result)
  return chain
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MutiraoMessageService.sendMessage', () => {
  it('envia a mensagem', async () => {
    const mockMessage = { id: 'msg-1', mutirao_id: 'mut-1', sender_id: 'user-1', content: 'Oi' }
    const chain = makeChain({ data: mockMessage, error: null })
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnValue(chain) } as any)

    const res = await getMutiraoMessageService().sendMessage('mut-1', 'user-1', '  Oi  ')

    expect(res.success).toBe(true)
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ mutirao_id: 'mut-1', sender_id: 'user-1', content: 'Oi' })
    )
  })

  it('rejeita mensagem vazia', async () => {
    const res = await getMutiraoMessageService().sendMessage('mut-1', 'user-1', '   ')
    expect(res.success).toBe(false)
  })
})

describe('MutiraoMessageService.getMessages', () => {
  it('retorna as mensagens em ordem cronológica', async () => {
    const chain = makeChain({ data: null, error: null })
    chain.order = vi.fn().mockResolvedValue({ data: [{ id: 'msg-1' }], error: null })
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnValue(chain) } as any)

    const res = await getMutiraoMessageService().getMessages('mut-1')

    expect(res.success).toBe(true)
    expect(res.data).toHaveLength(1)
  })
})
