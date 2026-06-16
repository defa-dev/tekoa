import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * Tipos de eventos do Realtime
 */
export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

/**
 * Tipos de tabelas que suportam Realtime
 */
export type RealtimeTable = 'messages' | 'mural_posts' | 'chats' | 'services' | 'products'

/**
 * Payload genérico para mudanças no Realtime
 */
export type RealtimePayload<T extends Record<string, any> = Record<string, any>> =
  RealtimePostgresChangesPayload<T>

/**
 * Callback para eventos de Realtime
 */
export type RealtimeCallback<T extends Record<string, any> = Record<string, any>> = (
  payload: RealtimePayload<T>
) => void

/**
 * Opções para subscrição de canal
 */
export interface ChannelSubscriptionOptions<
  T extends Record<string, any> = Record<string, any>,
> {
  table: RealtimeTable
  event: RealtimeEvent
  filter?: string
  callback: RealtimeCallback<T>
}

/**
 * Status da subscrição
 */
export type SubscriptionStatus = 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR'

/**
 * Informações do canal
 */
export interface ChannelInfo {
  id: string
  table: RealtimeTable
  status: SubscriptionStatus
  createdAt: Date
}

// Type helpers para payloads específicos de cada tabela
export type MessagePayload = RealtimePayload<Database['public']['Tables']['messages']['Row']>
export type MuralPostPayload = RealtimePayload<Database['public']['Tables']['mural_posts']['Row']>
export type ChatPayload = RealtimePayload<Database['public']['Tables']['chats']['Row']>
export type ServicePayload = RealtimePayload<Database['public']['Tables']['services']['Row']>
export type ProductPayload = RealtimePayload<Database['public']['Tables']['products']['Row']>
