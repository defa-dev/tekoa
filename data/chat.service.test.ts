import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ChatService, getChatService } from './chat.service'
import type { Database } from '@/types/database.types'

type Chat = Database['public']['Tables']['chats']['Row']
type Message = Database['public']['Tables']['messages']['Row']

// Mock do Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('ChatService', () => {
  let service: ChatService

  const mockChat: Chat = {
    id: 'chat-123',
    participant_1: 'user-1',
    participant_2: 'user-2',
    service_id: null,
    product_id: null,
    status: 'active',
    initiated_by: null,
    offerer_service_id: null,
    last_message: 'Olá!',
    last_message_at: '2024-01-01T00:00:00Z',
    last_sender_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  const mockMessage: Message = {
    id: 'msg-123',
    chat_id: 'chat-123',
    sender_id: 'user-1',
    content: 'Olá, tudo bem?',
    read: false,
    created_at: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ChatService()
  })

  describe('validate', () => {
    it('deve validar participantes iguais', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service['create']({
        participant_1: 'user-1',
        participant_2: 'user-1',
      } as any)

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('SAME_PARTICIPANTS')
    })
  })

  describe('createChat', () => {
    it('deve criar novo chat', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            or: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockChat,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.createChat('user-1', 'user-2')

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data!.chat).toEqual(mockChat)
      expect(result.data!.existing).toBe(false)
    })

    it('deve reaproveitar chat de produto existente', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const productChat = { ...mockChat, product_id: 'prod-1' }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            or: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [productChat],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.createChat('user-1', 'user-2', null, 'prod-1')

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data!.chat).toEqual(productChat)
      expect(result.data!.existing).toBe(true)
    })
  })

  describe('getUserChats', () => {
    it('deve buscar chats do usuário', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockClient = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'chats') {
            const mockChain = {
              or: vi.fn().mockReturnThis(),
              order: vi.fn().mockReturnThis(),
              then: vi.fn((resolve: any) => resolve({
                data: [mockChat],
                error: null,
              })),
            }
            return {
              select: vi.fn().mockReturnValue(mockChain),
            }
          }
          if (table === 'messages') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    neq: vi.fn().mockResolvedValue({
                      count: 0,
                    }),
                  }),
                }),
              }),
            }
          }
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as any)

      const result = await service.getUserChats('user-1')

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data?.[0].otherParticipantId).toBe('user-2')
    })
  })

  describe('getChatById', () => {
    it('deve buscar chat por ID', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockChat,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.getChatById('chat-123')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockChat)
    })
  })

  describe('getMessages', () => {
    it('deve buscar mensagens do chat', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockImplementation((table) => {
          if (table === 'chats') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockChat,
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === 'messages') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    range: vi.fn().mockResolvedValue({
                      data: [mockMessage],
                      error: null,
                    }),
                  }),
                }),
              }),
            }
          }
        }),
      } as any)

      const result = await service.getMessages('chat-123', 'user-1')

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
    })

    it('deve rejeitar acesso não autorizado', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockChat,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.getMessages('chat-123', 'user-3')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('FORBIDDEN')
    })
  })

  describe('sendMessage', () => {
    it('deve enviar mensagem', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockClient = {
        from: vi.fn().mockImplementation((table) => {
          if (table === 'chats') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockChat,
                    error: null,
                  }),
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: mockChat,
                      error: null,
                    }),
                  }),
                }),
              }),
            }
          }
          if (table === 'messages') {
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockMessage,
                    error: null,
                  }),
                }),
              }),
            }
          }
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as any)

      const result = await service.sendMessage('chat-123', 'user-1', 'Olá, tudo bem?')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockMessage)
    })

    it('deve rejeitar mensagem vazia', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockChat,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.sendMessage('chat-123', 'user-1', '')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('EMPTY_MESSAGE')
    })
  })

  describe('markAsRead', () => {
    it('deve marcar mensagem como lida', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockClient = {
        from: vi.fn().mockImplementation((table) => {
          if (table === 'chats') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockChat,
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === 'messages') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockMessage,
                    error: null,
                  }),
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: { ...mockMessage, read: true },
                      error: null,
                    }),
                  }),
                }),
              }),
            }
          }
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as any)

      const result = await service.markAsRead('msg-123', 'user-2')

      expect(result.success).toBe(true)
      expect(result.data?.read).toBe(true)
    })
  })

  describe('markChatAsRead', () => {
    it('deve marcar todas mensagens como lidas', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockClient = {
        from: vi.fn().mockImplementation((table) => {
          if (table === 'chats') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockChat,
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === 'messages') {
            return {
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    neq: vi.fn().mockResolvedValue({
                      error: null,
                    }),
                  }),
                }),
              }),
            }
          }
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as any)

      const result = await service.markChatAsRead('chat-123', 'user-2')

      expect(result.success).toBe(true)
    })
  })

  describe('deleteChat', () => {
    it('deve deletar chat e mensagens', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockClient = {
        from: vi.fn().mockImplementation((table) => {
          if (table === 'chats') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockChat,
                    error: null,
                  }),
                }),
              }),
              delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  error: null,
                }),
              }),
            }
          }
          if (table === 'messages') {
            return {
              delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  error: null,
                }),
              }),
            }
          }
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as any)

      const result = await service.deleteChat('chat-123', 'user-1')

      expect(result.success).toBe(true)
    })
  })

  describe('getUnreadCount', () => {
    it('deve contar mensagens não lidas', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockImplementation((table) => {
          if (table === 'chats') {
            return {
              select: vi.fn().mockReturnValue({
                or: vi.fn().mockResolvedValue({
                  data: [{ id: 'chat-123' }],
                  error: null,
                }),
              }),
            }
          }
          if (table === 'messages') {
            return {
              select: vi.fn().mockReturnValue({
                in: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    neq: vi.fn().mockResolvedValue({
                      count: 3,
                      error: null,
                    }),
                  }),
                }),
              }),
            }
          }
        }),
      } as any)

      const result = await service.getUnreadCount('user-1')

      expect(result.success).toBe(true)
      expect(result.data).toBe(3)
    })
  })

  describe('getChatService singleton', () => {
    it('deve retornar mesma instância', () => {
      const instance1 = getChatService()
      const instance2 = getChatService()

      expect(instance1).toBe(instance2)
    })
  })
})
