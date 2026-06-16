import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth/session', () => ({
  getAuthUser: vi.fn(),
  getCurrentProfile: vi.fn(),
}))
vi.mock('@/data/service.service', () => ({ getServiceService: vi.fn() }))
vi.mock('@/data/chat.service', () => ({ getChatService: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('@/lib/services/interest-intro', () => ({ buildInterestIntro: vi.fn(() => 'Olá, tenho interesse!') }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { getAuthUser, getCurrentProfile } from '@/lib/auth/session'
import { getServiceService } from '@/data/service.service'
import { getChatService } from '@/data/chat.service'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  startServiceChatAction,
  acceptServiceInterestAction,
  declineServiceInterestAction,
} from './interest-actions'

const mockUser = { id: 'user-1', email: 'u1@test.com' }
const mockOtherUser = { id: 'user-2', email: 'u2@test.com' }
const mockService = { id: 'svc-1', user_id: 'user-2', title: 'Aula de violão', status: 'active', type: 'offer' }
const mockChat = { id: 'chat-1', service_id: 'svc-1', status: 'pending', participant_1: 'user-1', participant_2: 'user-2', initiated_by: 'user-1' }

function makeAdminChain() {
  const chain: any = {}
  ;['from', 'update', 'eq'].forEach((m) => { chain[m] = vi.fn().mockReturnValue(chain) })
  return chain
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getCurrentProfile).mockResolvedValue({ full_name: 'João Silva', id: 'user-1' } as any)
})

describe('startServiceChatAction', () => {
  it('abre chat pendente e envia mensagem de introdução', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(mockUser as any)

    const mockSvcService = {
      getServiceById: vi.fn().mockResolvedValue({ success: true, data: mockService }),
      getUserServices: vi.fn().mockResolvedValue({ success: true, data: [] }),
    }
    const mockChatService = {
      findServiceInterestChat: vi.fn().mockResolvedValue({ success: true, data: null }),
      createServiceInterestChat: vi.fn().mockResolvedValue({ success: true, data: mockChat }),
      sendMessage: vi.fn().mockResolvedValue({ success: true, data: {} }),
    }
    vi.mocked(getServiceService).mockReturnValue(mockSvcService as any)
    vi.mocked(getChatService).mockReturnValue(mockChatService as any)

    const res = await startServiceChatAction('svc-1')

    expect(res.success).toBe(true)
    if (!res.success) return
    expect(res.data.chatId).toBe('chat-1')
    expect(res.data.existing).toBe(false)
    expect(mockChatService.sendMessage).toHaveBeenCalledWith(
      'chat-1', 'user-1', 'Olá, tenho interesse!', { bypassStatusGuard: true }
    )
  })

  it('reaproveita chat existente se já havia interesse', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(mockUser as any)

    const existingChat = { ...mockChat, status: 'pending' }
    vi.mocked(getServiceService).mockReturnValue({
      getServiceById: vi.fn().mockResolvedValue({ success: true, data: mockService }),
    } as any)
    vi.mocked(getChatService).mockReturnValue({
      findServiceInterestChat: vi.fn().mockResolvedValue({ success: true, data: existingChat }),
    } as any)

    const res = await startServiceChatAction('svc-1')

    expect(res.success).toBe(true)
    if (!res.success) return
    expect(res.data.chatId).toBe('chat-1')
    expect(res.data.existing).toBe(true)
  })

  it('bloqueia se serviço for do próprio usuário', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(mockUser as any)
    vi.mocked(getServiceService).mockReturnValue({
      getServiceById: vi.fn().mockResolvedValue({ success: true, data: { ...mockService, user_id: 'user-1' } }),
    } as any)

    const res = await startServiceChatAction('svc-1')

    expect(res.success).toBe(false)
    if (res.success) return
    expect(res.error).toMatch(/seu/i)
  })

  it('retorna erro se não autenticado', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null)
    const res = await startServiceChatAction('svc-1')
    expect(res.success).toBe(false)
  })
})

describe('acceptServiceInterestAction', () => {
  it('aceita interesse: chat → active, serviço → matched', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(mockOtherUser as any)

    const adminChain = makeAdminChain()
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnValue(adminChain) } as any)

    const mockChatService = {
      getChatById: vi.fn().mockResolvedValue({ success: true, data: mockChat }),
      updateChatStatus: vi.fn().mockResolvedValue({ success: true, data: {} }),
      sendMessage: vi.fn().mockResolvedValue({ success: true, data: {} }),
    }
    vi.mocked(getChatService).mockReturnValue(mockChatService as any)
    vi.mocked(getServiceService).mockReturnValue({
      getServiceById: vi.fn().mockResolvedValue({ success: true, data: mockService }),
    } as any)

    const res = await acceptServiceInterestAction('chat-1')

    expect(res.success).toBe(true)
    expect(mockChatService.updateChatStatus).toHaveBeenCalledWith('chat-1', 'user-2', 'active')
    expect(adminChain.update).toHaveBeenCalledWith({ status: 'matched' })
  })

  it('bloqueia quem iniciou o interesse de aceitar', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(mockUser as any) // user-1 iniciou

    vi.mocked(getChatService).mockReturnValue({
      getChatById: vi.fn().mockResolvedValue({ success: true, data: mockChat }),
    } as any)
    vi.mocked(getServiceService).mockReturnValue({
      getServiceById: vi.fn().mockResolvedValue({ success: true, data: mockService }),
    } as any)

    const res = await acceptServiceInterestAction('chat-1')

    expect(res.success).toBe(false)
    if (res.success) return
    expect(res.error).toMatch(/aceitar/i)
  })
})

describe('declineServiceInterestAction', () => {
  it('recusa interesse: chat → declined, serviço continua active', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(mockOtherUser as any)

    const mockChatService = {
      getChatById: vi.fn().mockResolvedValue({ success: true, data: mockChat }),
      updateChatStatus: vi.fn().mockResolvedValue({ success: true, data: {} }),
      sendMessage: vi.fn().mockResolvedValue({ success: true, data: {} }),
    }
    vi.mocked(getChatService).mockReturnValue(mockChatService as any)
    vi.mocked(getServiceService).mockReturnValue({
      getServiceById: vi.fn().mockResolvedValue({ success: true, data: mockService }),
    } as any)

    const res = await declineServiceInterestAction('chat-1')

    expect(res.success).toBe(true)
    expect(mockChatService.updateChatStatus).toHaveBeenCalledWith('chat-1', 'user-2', 'declined')
  })
})
