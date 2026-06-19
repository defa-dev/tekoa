import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth/session', () => ({
  getAuthUser: vi.fn(),
  getCurrentProfile: vi.fn(),
}))
vi.mock('@/data/chat.service', () => ({ getChatService: vi.fn() }))
vi.mock('@/data/product.service', () => ({ getProductService: vi.fn() }))
vi.mock('@/data/tekoin.service', () => ({ getTekoinService: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { getAuthUser, getCurrentProfile } from '@/lib/auth/session'
import { getChatService } from '@/data/chat.service'
import { getProductService } from '@/data/product.service'
import { getTekoinService } from '@/data/tekoin.service'
import { createAdminClient } from '@/lib/supabase/admin'
import { closeTradeAction } from './close-actions'

const mockUser = { id: 'user-1', email: 'u1@test.com' }
const activeServiceChat = {
  id: 'chat-1',
  service_id: 'svc-1',
  product_id: null,
  status: 'active',
  participant_1: 'user-1',
  participant_2: 'user-2',
  initiated_by: 'user-1',
}
const activeProductChat = {
  id: 'chat-1',
  service_id: null,
  product_id: 'prod-1',
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

function setupMocks(
  chatOverride?: Record<string, unknown>,
  base: typeof activeServiceChat | typeof activeProductChat = activeServiceChat
) {
  const chat = { ...base, ...chatOverride }
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

    it('bloqueia chat sem service_id nem product_id', async () => {
      setupMocks({ service_id: null as any })
      const res = await closeTradeAction('chat-1', 'completed')
      expect(res.success).toBe(false)
    })
  })

  describe('negociação de produto', () => {
    it('desfecho completed: marca produto como sold', async () => {
      const { adminChain, mockChatService } = setupMocks({}, activeProductChat)

      const res = await closeTradeAction('chat-1', 'completed')

      expect(res.success).toBe(true)
      expect(adminChain.update).toHaveBeenCalledWith({ status: 'sold' })
      expect(mockChatService.updateChatStatus).toHaveBeenCalledWith('chat-1', 'user-1', 'completed')
    })

    it('desfecho cancelled: produto volta para available', async () => {
      const { adminChain } = setupMocks({}, activeProductChat)

      const res = await closeTradeAction('chat-1', 'cancelled')

      expect(res.success).toBe(true)
      expect(adminChain.update).toHaveBeenCalledWith({ status: 'available' })
    })

    it('mensagem de sistema menciona a feira (cancelled)', async () => {
      const { mockChatService } = setupMocks({}, activeProductChat)

      await closeTradeAction('chat-1', 'cancelled')

      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        'chat-1',
        'user-1',
        expect.stringContaining('feira'),
        { bypassStatusGuard: true }
      )
    })

    it('mensagem de sistema menciona vendido (completed)', async () => {
      const { mockChatService } = setupMocks({}, activeProductChat)

      await closeTradeAction('chat-1', 'completed')

      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        'chat-1',
        'user-1',
        expect.stringContaining('vendido'),
        { bypassStatusGuard: true }
      )
    })
  })

  describe('pagamento com Tekoins (produto)', () => {
    it('transfere do comprador (não-dono) pro vendedor (dono do produto)', async () => {
      setupMocks({}, activeProductChat)
      vi.mocked(getProductService).mockReturnValue({
        getProductById: vi.fn().mockResolvedValue({ success: true, data: { user_id: 'user-2' } }),
      } as any)
      const donateOnFeira = vi.fn().mockResolvedValue({ success: true, data: {} })
      vi.mocked(getTekoinService).mockReturnValue({ donateOnFeira } as any)

      const res = await closeTradeAction('chat-1', 'completed', 20)

      expect(res.success).toBe(true)
      expect(donateOnFeira).toHaveBeenCalledWith('user-1', 'user-2', 20, 'prod-1')
    })

    it('bloqueia o encerramento se o saldo for insuficiente', async () => {
      setupMocks({}, activeProductChat)
      vi.mocked(getProductService).mockReturnValue({
        getProductById: vi.fn().mockResolvedValue({ success: true, data: { user_id: 'user-2' } }),
      } as any)
      vi.mocked(getTekoinService).mockReturnValue({
        donateOnFeira: vi.fn().mockResolvedValue({ success: false, error: { message: 'Saldo de Tekoins insuficiente' } }),
      } as any)

      const res = await closeTradeAction('chat-1', 'completed', 20)

      expect(res.success).toBe(false)
    })

    it('não tenta pagar com Tekoins quando o desfecho é cancelled', async () => {
      setupMocks({}, activeProductChat)
      const donateOnFeira = vi.fn()
      vi.mocked(getTekoinService).mockReturnValue({ donateOnFeira } as any)

      const res = await closeTradeAction('chat-1', 'cancelled', 20)

      expect(res.success).toBe(true)
      expect(donateOnFeira).not.toHaveBeenCalled()
    })

    it('ignora tekoinsOffered em troca de serviço (não produto)', async () => {
      setupMocks()
      const donateOnFeira = vi.fn()
      vi.mocked(getTekoinService).mockReturnValue({ donateOnFeira } as any)

      const res = await closeTradeAction('chat-1', 'completed', 20)

      expect(res.success).toBe(true)
      expect(donateOnFeira).not.toHaveBeenCalled()
    })
  })
})
