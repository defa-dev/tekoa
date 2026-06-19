import { BaseService } from './base.service'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ServiceResult } from './types'
import type { Database } from '@/types/database.types'

type Trade = Database['public']['Tables']['trades']['Row']
type TradeInsert = Database['public']['Tables']['trades']['Insert']

export interface CreateTradeData {
  chat_id: string
  service_id?: string | null
  product_id?: string | null
  participant_1: string
  participant_2: string
  closed_by: string
  outcome: Trade['outcome']
}

export interface TradeWithDetails extends Trade {
  otherParticipantId: string
}

export class TradeService extends BaseService<Trade> {
  constructor() {
    super('trades')
  }

  protected validate(data: Partial<Trade>): ServiceResult<Trade> {
    if (data.participant_1 && data.participant_2 && data.participant_1 === data.participant_2) {
      return {
        success: false,
        error: { message: 'Participantes devem ser diferentes', code: 'SAME_PARTICIPANTS' },
      }
    }
    return { success: true, data: data as Trade }
  }

  /**
   * Registra uma troca encerrada. Usa admin client pra bypass RLS
   * (a autorização já foi validada no close-actions).
   */
  public async createTrade(data: CreateTradeData): Promise<ServiceResult<Trade>> {
    try {
      const insertData: TradeInsert = {
        chat_id: data.chat_id,
        service_id: data.service_id ?? null,
        product_id: data.product_id ?? null,
        participant_1: data.participant_1,
        participant_2: data.participant_2,
        closed_by: data.closed_by,
        outcome: data.outcome,
      }

      const { data: trade, error } = await createAdminClient()
        .from('trades')
        .insert(insertData)
        .select()
        .single()

      if (error) return this.handleError(error)
      return { success: true, data: trade as Trade }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Histórico de trocas de um usuário (como participante), mais recentes primeiro.
   */
  public async getUserTrades(userId: string): Promise<ServiceResult<TradeWithDetails[]>> {
    try {
      const client = await this.ensureClient()
      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order('closed_at', { ascending: false })

      if (error) return this.handleError(error)

      const trades = ((data ?? []) as Trade[]).map((t) => ({
        ...t,
        otherParticipantId: t.participant_1 === userId ? t.participant_2 : t.participant_1,
      }))

      return { success: true, data: trades }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Troca vinculada a um chat específico (se existir).
   */
  public async getTradeByChat(chatId: string): Promise<ServiceResult<Trade | null>> {
    try {
      const client = await this.ensureClient()
      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .eq('chat_id', chatId)
        .maybeSingle()

      if (error) return this.handleError(error)
      return { success: true, data: (data as Trade) ?? null }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Contagem de trocas concluídas (outcome completed ou partial) de um usuário.
   */
  public async getCompletedTradeCount(userId: string): Promise<ServiceResult<number>> {
    try {
      const client = await this.ensureClient()
      const { count, error } = await client
        .from(this.tableName as any)
        .select('*', { count: 'exact', head: true })
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .in('outcome', ['completed', 'partial'])

      if (error) return this.handleError(error)
      return { success: true, data: count ?? 0 }
    } catch (error) {
      return this.handleError(error)
    }
  }
}

let tradeServiceInstance: TradeService | null = null

export function getTradeService(): TradeService {
  if (!tradeServiceInstance) {
    tradeServiceInstance = new TradeService()
  }
  return tradeServiceInstance
}
