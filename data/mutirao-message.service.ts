import { BaseService } from './base.service'
import type { ServiceResult } from './types'
import type { MutiraoMessage } from '@/types'

/**
 * Chat em grupo do mutirão — tabela própria (`mutirao_messages`), separada
 * do chat 1:1 (`chats`/`messages`) pra não relaxar suas constraints. RLS
 * garante que só organizador + confirmados leem/enviam.
 */
class MutiraoMessageService extends BaseService<MutiraoMessage> {
  constructor() {
    super('mutirao_messages')
  }

  protected validate(data: Partial<MutiraoMessage>): ServiceResult<MutiraoMessage> {
    if (data.content !== undefined && (!data.content || data.content.trim().length === 0)) {
      return {
        success: false,
        error: { message: 'Mensagem não pode estar vazia', code: 'EMPTY_MESSAGE' },
      }
    }
    return { success: true, data: data as MutiraoMessage }
  }

  public async sendMessage(
    mutiraoId: string,
    senderId: string,
    content: string
  ): Promise<ServiceResult<MutiraoMessage>> {
    return this.create({
      mutirao_id: mutiraoId,
      sender_id: senderId,
      content: content.trim(),
    } as Partial<MutiraoMessage>)
  }

  public async getMessages(mutiraoId: string): Promise<ServiceResult<MutiraoMessage[]>> {
    try {
      const client = await this.ensureClient()
      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .eq('mutirao_id', mutiraoId)
        .order('created_at', { ascending: true })

      if (error) return this.handleError(error)
      return { success: true, data: (data ?? []) as MutiraoMessage[] }
    } catch (error) {
      return this.handleError(error)
    }
  }
}

let mutiraoMessageServiceInstance: MutiraoMessageService | null = null

export function getMutiraoMessageService(): MutiraoMessageService {
  if (!mutiraoMessageServiceInstance) {
    mutiraoMessageServiceInstance = new MutiraoMessageService()
  }
  return mutiraoMessageServiceInstance
}
