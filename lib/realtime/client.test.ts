import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RealtimeClient, getRealtimeClient, resetRealtimeClient } from './client'

// Mock do Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

describe('RealtimeClient', () => {
  let client: RealtimeClient
  let mockChannel: any
  let mockSupabaseClient: any

  beforeEach(async () => {
    // Reset singleton
    resetRealtimeClient()

    // Mock do canal
    mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockImplementation((callback) => {
        // Simular subscrição bem sucedida
        if (typeof callback === 'function') {
          callback('SUBSCRIBED')
        }
        return mockChannel
      }),
    }

    // Mock do cliente Supabase
    mockSupabaseClient = {
      channel: vi.fn().mockReturnValue(mockChannel),
      removeChannel: vi.fn().mockResolvedValue(undefined),
    }

    const { createClient } = await import('@/lib/supabase/client')
    vi.mocked(createClient).mockReturnValue(mockSupabaseClient as any)

    client = new RealtimeClient()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('subscribe', () => {
    it('deve criar subscrição para uma tabela', () => {
      const callback = vi.fn()

      const channelId = client.subscribe({
        table: 'messages',
        event: '*',
        callback,
      })

      expect(channelId).toBe('messages')
      expect(mockSupabaseClient.channel).toHaveBeenCalledWith('messages')
      expect(mockChannel.on).toHaveBeenCalled()
      expect(mockChannel.subscribe).toHaveBeenCalled()
    })

    it('deve criar subscrição com filtro', () => {
      const callback = vi.fn()

      const channelId = client.subscribe({
        table: 'messages',
        event: 'INSERT',
        filter: 'chat_id=eq.123',
        callback,
      })

      expect(channelId).toBe('messages:chat_id=eq.123')
      expect(mockChannel.on).toHaveBeenCalled()
    })

    it('deve reutilizar canal existente', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      client.subscribe({
        table: 'messages',
        event: '*',
        callback: callback1,
      })

      client.subscribe({
        table: 'messages',
        event: '*',
        callback: callback2,
      })

      // Channel deve ser criado apenas uma vez
      expect(mockSupabaseClient.channel).toHaveBeenCalledTimes(1)
    })

    it('deve executar callback quando receber evento', () => {
      const callback = vi.fn()
      let capturedCallback: any

      mockChannel.on.mockImplementation((event: string, config: any, cb: any) => {
        capturedCallback = cb
        return mockChannel
      })

      client.subscribe({
        table: 'messages',
        event: '*',
        callback,
      })

      // Simular evento
      const mockPayload = { eventType: 'INSERT', new: { id: '123' } }
      capturedCallback(mockPayload)

      expect(callback).toHaveBeenCalledWith(mockPayload)
    })
  })

  describe('unsubscribe', () => {
    it('deve remover subscrição', async () => {
      const callback = vi.fn()

      const channelId = client.subscribe({
        table: 'messages',
        event: '*',
        callback,
      })

      await client.unsubscribe(channelId)

      expect(mockSupabaseClient.removeChannel).toHaveBeenCalledWith(mockChannel)
      expect(client.getChannelInfo(channelId)).toBeUndefined()
    })

    it('deve lidar com canal inexistente', async () => {
      await expect(client.unsubscribe('non-existent')).resolves.toBeUndefined()
    })
  })

  describe('unsubscribeAll', () => {
    it('deve remover todas as subscrições', async () => {
      const callback = vi.fn()

      client.subscribe({ table: 'messages', event: '*', callback })
      client.subscribe({ table: 'mural_posts', event: '*', callback })

      await client.unsubscribeAll()

      expect(mockSupabaseClient.removeChannel).toHaveBeenCalledTimes(2)
      expect(client.getAllChannelsInfo()).toHaveLength(0)
    })
  })

  describe('getChannelInfo', () => {
    it('deve retornar informações do canal', () => {
      const callback = vi.fn()

      const channelId = client.subscribe({
        table: 'messages',
        event: '*',
        callback,
      })

      const info = client.getChannelInfo(channelId)

      expect(info).toBeDefined()
      expect(info?.id).toBe(channelId)
      expect(info?.table).toBe('messages')
      expect(info?.status).toBe('SUBSCRIBED')
    })

    it('deve retornar undefined para canal inexistente', () => {
      const info = client.getChannelInfo('non-existent')
      expect(info).toBeUndefined()
    })
  })

  describe('getAllChannelsInfo', () => {
    it('deve retornar lista de todos os canais', () => {
      const callback = vi.fn()

      client.subscribe({ table: 'messages', event: '*', callback })
      client.subscribe({ table: 'mural_posts', event: '*', callback })

      const allInfo = client.getAllChannelsInfo()

      expect(allInfo).toHaveLength(2)
    })
  })

  describe('isChannelActive', () => {
    it('deve retornar true para canal ativo', () => {
      const callback = vi.fn()

      const channelId = client.subscribe({
        table: 'messages',
        event: '*',
        callback,
      })

      expect(client.isChannelActive(channelId)).toBe(true)
    })

    it('deve retornar false para canal inativo', () => {
      expect(client.isChannelActive('non-existent')).toBe(false)
    })
  })

  describe('getActiveChannelsCount', () => {
    it('deve retornar contagem correta de canais ativos', () => {
      const callback = vi.fn()

      client.subscribe({ table: 'messages', event: '*', callback })
      client.subscribe({ table: 'mural_posts', event: '*', callback })

      expect(client.getActiveChannelsCount()).toBe(2)
    })
  })

  describe('helper methods', () => {
    it('subscribeToChat deve criar subscrição para chat', () => {
      const callback = vi.fn()

      const channelId = client.subscribeToChat('chat-123', callback)

      expect(channelId).toContain('messages')
      expect(channelId).toContain('chat-123')
    })

    it('subscribeToMuralPosts deve criar subscrição para mural', () => {
      const callback = vi.fn()

      const channelId = client.subscribeToMuralPosts(callback)

      expect(channelId).toBe('mural_posts')
    })

    it('subscribeToUserChats deve criar subscrição para chats do usuário', () => {
      const callback = vi.fn()

      const channelId = client.subscribeToUserChats('user-123', callback)

      expect(channelId).toContain('chats')
    })

    it('subscribeToServices deve criar subscrição para serviços', () => {
      const callback = vi.fn()

      const channelId = client.subscribeToServices(callback)

      expect(channelId).toBe('services')
    })

    it('subscribeToProducts deve criar subscrição para produtos', () => {
      const callback = vi.fn()

      const channelId = client.subscribeToProducts(callback)

      expect(channelId).toBe('products')
    })
  })

  describe('event-specific subscriptions', () => {
    it('subscribeToInserts deve subscrever apenas INSERTs', () => {
      const callback = vi.fn()

      client.subscribeToInserts('messages', callback)

      expect(mockChannel.on).toHaveBeenCalled()
      const onCall = mockChannel.on.mock.calls[0]
      expect(onCall[1].event).toBe('INSERT')
    })

    it('subscribeToUpdates deve subscrever apenas UPDATEs', () => {
      const callback = vi.fn()

      client.subscribeToUpdates('messages', callback)

      const onCall = mockChannel.on.mock.calls[0]
      expect(onCall[1].event).toBe('UPDATE')
    })

    it('subscribeToDeletes deve subscrever apenas DELETEs', () => {
      const callback = vi.fn()

      client.subscribeToDeletes('messages', callback)

      const onCall = mockChannel.on.mock.calls[0]
      expect(onCall[1].event).toBe('DELETE')
    })
  })

  describe('reconnectChannel', () => {
    it('deve reconectar canal', async () => {
      const callback = vi.fn()

      const channelId = client.subscribe({
        table: 'messages',
        event: '*',
        callback,
      })

      await client.reconnectChannel(channelId)

      expect(mockSupabaseClient.removeChannel).toHaveBeenCalled()
    })

    it('deve lidar com canal inexistente', async () => {
      await expect(
        client.reconnectChannel('non-existent')
      ).resolves.toBeUndefined()
    })
  })

  describe('cleanup', () => {
    it('deve limpar todos os recursos', async () => {
      const callback = vi.fn()

      client.subscribe({ table: 'messages', event: '*', callback })
      client.subscribe({ table: 'mural_posts', event: '*', callback })

      await client.cleanup()

      expect(mockSupabaseClient.removeChannel).toHaveBeenCalledTimes(2)
      expect(client.getAllChannelsInfo()).toHaveLength(0)
      expect(client.getActiveChannelsCount()).toBe(0)
    })
  })

  describe('singleton', () => {
    it('getRealtimeClient deve retornar mesma instância', () => {
      const instance1 = getRealtimeClient()
      const instance2 = getRealtimeClient()

      expect(instance1).toBe(instance2)
    })

    it('resetRealtimeClient deve limpar singleton', () => {
      const instance1 = getRealtimeClient()
      resetRealtimeClient()
      const instance2 = getRealtimeClient()

      expect(instance1).not.toBe(instance2)
    })
  })
})
