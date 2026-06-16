import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import type {
  ChannelSubscriptionOptions,
  ChannelInfo,
  RealtimeTable,
  SubscriptionStatus,
} from './types'

/**
 * Cliente Realtime para gerenciar subscrições e canais do Supabase
 * 
 * Responsável por:
 * - Criar e gerenciar canais Realtime
 * - Subscrever mudanças em tabelas
 * - Unsubscribe e cleanup de recursos
 * - Monitorar status de conexões
 */
export class RealtimeClient {
  private client: SupabaseClient
  private channels: Map<string, RealtimeChannel> = new Map()
  private channelInfo: Map<string, ChannelInfo> = new Map()

  constructor() {
    this.client = createClient()
  }

  /**
   * Gera um ID único para o canal baseado na tabela e filtro
   */
  private generateChannelId(table: RealtimeTable, filter?: string): string {
    return filter ? `${table}:${filter}` : table
  }

  /**
   * Cria ou retorna canal existente
   */
  private getOrCreateChannel(channelId: string): RealtimeChannel {
    if (this.channels.has(channelId)) {
      return this.channels.get(channelId)!
    }

    const channel = this.client.channel(channelId)
    this.channels.set(channelId, channel)

    return channel
  }

  /**
   * Subscreve a mudanças em uma tabela
   */
  public subscribe<T extends Record<string, any> = Record<string, any>>(
    options: ChannelSubscriptionOptions<T>
  ): string {
    const { table, event, filter, callback } = options
    const channelId = this.generateChannelId(table, filter)
    const channel = this.getOrCreateChannel(channelId)

    // Configurar listener
    const config: any = {
      event,
      schema: 'public',
      table,
    }

    if (filter) {
      config.filter = filter
    }

    channel
      .on('postgres_changes', config, (payload) => {
        callback(payload as any)
      })
      .subscribe((status: SubscriptionStatus) => {
        // Atualizar informações do canal
        const info = this.channelInfo.get(channelId)
        if (info) {
          info.status = status
        } else {
          this.channelInfo.set(channelId, {
            id: channelId,
            table,
            status,
            createdAt: new Date(),
          })
        }

        // Log de debug (remover em produção)
        console.log(`[Realtime] Channel ${channelId} status: ${status}`)
      })

    return channelId
  }

  /**
   * Cancela subscrição de um canal específico
   */
  public async unsubscribe(channelId: string): Promise<void> {
    const channel = this.channels.get(channelId)
    if (!channel) {
      console.warn(`[Realtime] Channel ${channelId} not found`)
      return
    }

    await this.client.removeChannel(channel)
    this.channels.delete(channelId)
    this.channelInfo.delete(channelId)

    console.log(`[Realtime] Unsubscribed from channel ${channelId}`)
  }

  /**
   * Cancela todas as subscrições
   */
  public async unsubscribeAll(): Promise<void> {
    const channelIds = Array.from(this.channels.keys())

    await Promise.all(
      channelIds.map((channelId) => this.unsubscribe(channelId))
    )

    console.log('[Realtime] Unsubscribed from all channels')
  }

  /**
   * Obtém informações de um canal
   */
  public getChannelInfo(channelId: string): ChannelInfo | undefined {
    return this.channelInfo.get(channelId)
  }

  /**
   * Obtém todas as informações de canais ativos
   */
  public getAllChannelsInfo(): ChannelInfo[] {
    return Array.from(this.channelInfo.values())
  }

  /**
   * Verifica se um canal está ativo
   */
  public isChannelActive(channelId: string): boolean {
    const info = this.channelInfo.get(channelId)
    return info?.status === 'SUBSCRIBED'
  }

  /**
   * Obtém quantidade de canais ativos
   */
  public getActiveChannelsCount(): number {
    return Array.from(this.channelInfo.values()).filter(
      (info) => info.status === 'SUBSCRIBED'
    ).length
  }

  /**
   * Subscreve a mensagens de um chat específico
   */
  public subscribeToChat(chatId: string, callback: (payload: any) => void): string {
    return this.subscribe({
      table: 'messages',
      event: '*',
      filter: `chat_id=eq.${chatId}`,
      callback,
    })
  }

  /**
   * Subscreve a posts do mural
   */
  public subscribeToMuralPosts(callback: (payload: any) => void): string {
    return this.subscribe({
      table: 'mural_posts',
      event: '*',
      callback,
    })
  }

  /**
   * Subscreve a chats de um usuário
   */
  public subscribeToUserChats(userId: string, callback: (payload: any) => void): string {
    // Nota: Como a tabela chats tem dois campos de usuário (user1_id e user2_id),
    // precisamos fazer duas subscrições ou usar uma lógica no callback
    return this.subscribe({
      table: 'chats',
      event: '*',
      filter: `or(user1_id.eq.${userId},user2_id.eq.${userId})`,
      callback,
    })
  }

  /**
   * Subscreve a serviços (ofertas/pedidos)
   */
  public subscribeToServices(callback: (payload: any) => void): string {
    return this.subscribe({
      table: 'services',
      event: '*',
      callback,
    })
  }

  /**
   * Subscreve a produtos
   */
  public subscribeToProducts(callback: (payload: any) => void): string {
    return this.subscribe({
      table: 'products',
      event: '*',
      callback,
    })
  }

  /**
   * Subscreve apenas a inserções em uma tabela
   */
  public subscribeToInserts<T extends Record<string, any> = Record<string, any>>(
    table: RealtimeTable,
    callback: (payload: any) => void,
    filter?: string
  ): string {
    return this.subscribe<T>({
      table,
      event: 'INSERT',
      filter,
      callback,
    })
  }

  /**
   * Subscreve apenas a atualizações em uma tabela
   */
  public subscribeToUpdates<T extends Record<string, any> = Record<string, any>>(
    table: RealtimeTable,
    callback: (payload: any) => void,
    filter?: string
  ): string {
    return this.subscribe<T>({
      table,
      event: 'UPDATE',
      filter,
      callback,
    })
  }

  /**
   * Subscreve apenas a deleções em uma tabela
   */
  public subscribeToDeletes<T extends Record<string, any> = Record<string, any>>(
    table: RealtimeTable,
    callback: (payload: any) => void,
    filter?: string
  ): string {
    return this.subscribe<T>({
      table,
      event: 'DELETE',
      filter,
      callback,
    })
  }

  /**
   * Reconecta um canal que perdeu conexão
   */
  public async reconnectChannel(channelId: string): Promise<void> {
    const channel = this.channels.get(channelId)
    if (!channel) {
      console.warn(`[Realtime] Channel ${channelId} not found`)
      return
    }

    // Unsubscribe e limpar
    await this.unsubscribe(channelId)

    console.log(`[Realtime] Reconnecting channel ${channelId}...`)
  }

  /**
   * Limpa todos os recursos (cleanup)
   */
  public async cleanup(): Promise<void> {
    await this.unsubscribeAll()
    this.channels.clear()
    this.channelInfo.clear()

    console.log('[Realtime] Cleanup completed')
  }
}

// Singleton instance
let realtimeClientInstance: RealtimeClient | null = null

/**
 * Obtém instância singleton do RealtimeClient
 */
export function getRealtimeClient(): RealtimeClient {
  if (!realtimeClientInstance) {
    realtimeClientInstance = new RealtimeClient()
  }
  return realtimeClientInstance
}

/**
 * Reseta a instância singleton (útil para testes)
 */
export function resetRealtimeClient(): void {
  if (realtimeClientInstance) {
    realtimeClientInstance.cleanup()
    realtimeClientInstance = null
  }
}
