import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as postMessages } from './route'
import { GET as getMessages, POST as markChatRead } from './[chatId]/route'

// Mock das dependências
vi.mock('@/lib/auth/session', () => ({
  getAuthUser: vi.fn(),
}))

vi.mock('@/data/chat.service', () => ({
  getChatService: vi.fn(),
}))

import { getAuthUser } from '@/lib/auth/session'
import { getChatService } from '@/data/chat.service'

describe('API Routes - Messages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/messages', () => {
    it('deve enviar uma mensagem com sucesso', async () => {
      const mockUser = { id: 'user-1', email: 'test@test.com' }
      const mockMessage = {
        id: 'msg-1',
        chat_id: 'chat-1',
        sender_id: 'user-1',
        content: 'teste',
        read: false,
        created_at: new Date().toISOString(),
      }

      vi.mocked(getAuthUser).mockResolvedValue(mockUser as any)
      vi.mocked(getChatService).mockReturnValue({
        sendMessage: vi.fn().mockResolvedValue({
          success: true,
          data: mockMessage,
        }),
      } as any)

      const req = new NextRequest('http://localhost/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          chatId: 'chat-1',
          content: 'teste',
        }),
      })

      const res = await postMessages(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.id).toBe('msg-1')
      expect(data.content).toBe('teste')
    })

    it('deve retornar 401 se não autenticado', async () => {
      vi.mocked(getAuthUser).mockResolvedValue(null)

      const req = new NextRequest('http://localhost/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          chatId: 'chat-1',
          content: 'teste',
        }),
      })

      const res = await postMessages(req)

      expect(res.status).toBe(401)
    })

    it('deve retornar 400 se faltarem parâmetros', async () => {
      vi.mocked(getAuthUser).mockResolvedValue({ id: 'user-1' } as any)

      const req = new NextRequest('http://localhost/api/messages', {
        method: 'POST',
        body: JSON.stringify({ chatId: 'chat-1' }), // falta content
      })

      const res = await postMessages(req)

      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/messages/[chatId]', () => {
    it('deve buscar mensagens com sucesso', async () => {
      const mockUser = { id: 'user-1', email: 'test@test.com' }
      const mockMessages = [
        {
          id: 'msg-1',
          chat_id: 'chat-1',
          sender_id: 'user-1',
          content: 'msg 1',
          read: true,
          created_at: new Date().toISOString(),
        },
      ]

      vi.mocked(getAuthUser).mockResolvedValue(mockUser as any)
      vi.mocked(getChatService).mockReturnValue({
        getMessages: vi.fn().mockResolvedValue({
          success: true,
          data: mockMessages,
        }),
      } as any)

      const req = new NextRequest('http://localhost/api/messages/chat-1')
      const res = await getMessages(req, {
        params: Promise.resolve({ chatId: 'chat-1' }),
      })
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data[0].id).toBe('msg-1')
    })

    it('deve retornar 401 se não autenticado', async () => {
      vi.mocked(getAuthUser).mockResolvedValue(null)

      const req = new NextRequest('http://localhost/api/messages/chat-1')
      const res = await getMessages(req, {
        params: Promise.resolve({ chatId: 'chat-1' }),
      })

      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/messages/[chatId] (mark as read)', () => {
    it('deve marcar chat como lido com sucesso', async () => {
      const mockUser = { id: 'user-1', email: 'test@test.com' }

      vi.mocked(getAuthUser).mockResolvedValue(mockUser as any)
      vi.mocked(getChatService).mockReturnValue({
        markChatAsRead: vi.fn().mockResolvedValue(undefined),
      } as any)

      const req = new NextRequest('http://localhost/api/messages/chat-1', {
        method: 'POST',
      })
      const res = await markChatRead(req, {
        params: Promise.resolve({ chatId: 'chat-1' }),
      })
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('deve retornar 401 se não autenticado', async () => {
      vi.mocked(getAuthUser).mockResolvedValue(null)

      const req = new NextRequest('http://localhost/api/messages/chat-1', {
        method: 'POST',
      })
      const res = await markChatRead(req, {
        params: Promise.resolve({ chatId: 'chat-1' }),
      })

      expect(res.status).toBe(401)
    })
  })
})
