import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth/session', () => ({
  getAuthUser: vi.fn(),
  getCurrentProfile: vi.fn(),
}))
vi.mock('@/data/chat.service', () => ({ getChatService: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { getAuthUser, getCurrentProfile } from '@/lib/auth/session'
import { getChatService } from '@/data/chat.service'
import { createAdminClient } from '@/lib/supabase/admin'
import { closeTradeAction } from './close-actions'

const mockUser = { id: 'user-1', email: 'u1@test.com' }
const activeServiceChat = {
  id: 'chat-1',
  service_id: 'svc-1',
  status: 'active',
  participant_1: 'user-1',
  participant_2: 'user-2',
  initiated_by: 'user-1',
}

function makeAdminChain() {
  const chain: any = {}
  ;['from', 'update', 'eq'].forEach((m) => { chain[m] = vi.fn().mockReturnValue(chain) })
  return chain
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getAuthUser).mockResolvedValue(mockUser as any)
  vi.mocked(getCurrentProfile).mockResolvedValue({ full_name: 'João Silva', id: 'user-1' } as any)
})

function setupMocks(chatOverride?: Partial<typeof activeServiceChat>) {
  const chat = { ...activeServiceChat, ...chatOverride }
  const adminChain = makeAdminChain()
  vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnValue(adminChain) } as any)

  const mockChatService = {
    getChatById: vi.fn().mockResolvedValue({ success: true, data: chat }),
    updateChatStatus: vi.fn().mockResolvedValue({ success: true, data: {} }),
    sendMessage: vi.fn().mockResolvedValue({ success: true, data: {} }),
  }
  vi.mocked(getChatService).mockReturnValue(mockChatService as any)

  return { adminChain, mockChatService }
}

describe('closeTradeAction', () => {
  describe('desfecho: completed', () => {
    it('encerra chat e marca serviço como completed', async () => {
      const { adminChain, mockChatService } = setupMocks()

      const res = await closeTradeAction('chat-1', 'completed')

      expect(res.success).toBe(true)
      expect(adminChain.update).toHaveBeenCalledWith({ status: 'completed' })
      expect(mockChatService.updateChatStatus).toHaveBeenCalledWith('chat-1', 'user-1', 'completed')
    })

    it('envia mensagem de conclusão', async () => {
      const { mockChatService } = setupMocks()

      await closeTradeAction('chat-1', 'completed')

      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        'chat-1',
        'user-1',
        expect.stringContaining('concluída'),
        { bypassStatusGuard: true }
      )
    })
  })

  describe('desfecho: partial', () => {
    it('encerra chat e marca serviço como completed', async () => {
      const { adminChain, mockChatService } = setupMocks()

      const res = await closeTradeAction('chat-1', 'partial')

      expect(res.success).toBe(true)
      expect(adminChain.update).toHaveBeenCalledWith({ status: 'completed' })
      expect(mockChatService.updateChatStatus).toHaveBeenCalledWith('chat-1', 'user-1', 'completed')
    })
  })

  describe('desfecho: cancelled', () => {
    it('volta serviço para active (roda) e encerra chat', async () => {
      const { adminChain, mockChatService } = setupMocks()

      const res = await closeTradeAction('chat-1', 'cancelled')

      expect(res.success).toBe(true)
      expect(adminChain.update).toHaveBeenCalledWith({ status: 'active' })
      expect(mockChatService.updateChatStatus).toHaveBeenCalledWith('chat-1', 'user-1', 'completed')
    })

    it('envia mensagem informando que oferta voltou para a roda', async () => {
      const { mockChatService } = setupMocks()

      await closeTradeAction('chat-1', 'cancelled')

      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        'chat-1',
        'user-1',
        expect.stringContaining('roda'),
        { bypassStatusGuard: true }
      )
    })
  })

  describe('validações', () => {
    it('retorna erro se não autenticado', async () => {
      vi.mocked(getAuthUser).mockResolvedValue(null)
      const res = await closeTradeAction('chat-1', 'completed')
      expect(res.success).toBe(false)
    })

    it('bloqueia se usuário não é participante', async () => {
      setupMocks({ participant_1: 'user-99', participant_2: 'user-88' })
      const res = await closeTradeAction('chat-1', 'completed')
      expect(res.success).toBe(false)
      if (res.success) return
      expect(res.error).toMatch(/negado/i)
    })

    it('bloqueia encerrar chat que não está active', async () => {
      setupMocks({ status: 'completed' })
      const res = await closeTradeAction('chat-1', 'completed')
      expect(res.success).toBe(false)
    })

    it('bloqueia chat sem service_id', async () => {
      setupMocks({ service_id: null as any })
      const res = await closeTradeAction('chat-1', 'completed')
      expect(res.success).toBe(false)
    })
  })
})
