import { BaseService } from './base.service'
import type { ServiceResult } from './types'
import type { Database } from '@/types/database.types'

type Chat = Database['public']['Tables']['chats']['Row']
type ChatInsert = Database['public']['Tables']['chats']['Insert']
type ChatUpdate = Database['public']['Tables']['chats']['Update']
type Message = Database['public']['Tables']['messages']['Row']
type MessageInsert = Database['public']['Tables']['messages']['Insert']
type MessageUpdate = Database['public']['Tables']['messages']['Update']

/**
 * Chat com informações extras
 */
export interface ChatWithDetails extends Chat {
  unreadCount?: number
  otherParticipantId?: string
  /** Título do serviço vinculado (interesse em troca). */
  serviceTitle?: string | null
}

/**
 * Service para gerenciar chats e mensagens
 * 
 * Responsável por:
 * - Criar e gerenciar chats entre usuários
 * - Enviar e receber mensagens
 * - Marcar mensagens como lidas
 * - Buscar histórico de conversas
 */
export class ChatService extends BaseService<Chat> {
  constructor() {
    super('chats')
  }

  /**
   * Valida dados do chat
   */
  protected validate(data: Partial<Chat>): ServiceResult<Chat> {
    // Validar participantes
    if (data.participant_1 !== undefined && !data.participant_1) {
      return {
        success: false,
        error: {
          message: 'Participante 1 é obrigatório',
          code: 'INVALID_PARTICIPANT',
        },
      }
    }

    if (data.participant_2 !== undefined && !data.participant_2) {
      return {
        success: false,
        error: {
          message: 'Participante 2 é obrigatório',
          code: 'INVALID_PARTICIPANT',
        },
      }
    }

    // Participantes não podem ser iguais
    if (data.participant_1 && data.participant_2 && data.participant_1 === data.participant_2) {
      return {
        success: false,
        error: {
          message: 'Participantes devem ser diferentes',
          code: 'SAME_PARTICIPANTS',
        },
      }
    }

    return { success: true, data: data as Chat }
  }

  /**
   * Cria um novo chat entre dois usuários (feira / produto).
   * Reaproveita conversa existente entre os mesmos participantes.
   * `existing` indica se a conversa retornada já existia (útil pra evitar
   * reenviar a mensagem automática de abertura).
   */
  public async createChat(
    participant1: string,
    participant2: string,
    serviceId?: string | null,
    productId?: string | null
  ): Promise<ServiceResult<{ chat: Chat; existing: boolean }>> {
    try {
      const client = await this.ensureClient()

      // Produtos: um chat por par (comportamento anterior).
      if (productId) {
        const { data: existingChats, error: searchError } = await client
          .from(this.tableName as any)
          .select('*')
          .or(
            `and(participant_1.eq.${participant1},participant_2.eq.${participant2}),and(participant_1.eq.${participant2},participant_2.eq.${participant1})`
          )
          .eq('product_id', productId)
          .limit(1)

        if (searchError) return this.handleError(searchError)
        if (existingChats?.length) {
          return { success: true, data: { chat: existingChats[0] as Chat, existing: true } }
        }
      }

      const insertData: ChatInsert = {
        participant_1: participant1,
        participant_2: participant2,
        service_id: serviceId ?? null,
        product_id: productId ?? null,
        status: 'active',
      }

      const created = await this.create(insertData)
      if (!created.success) return { success: false, error: created.error }
      return { success: true, data: { chat: created.data!, existing: false } }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Busca chat de interesse num serviço (um por pessoa por serviço).
   */
  public async findServiceInterestChat(
    serviceId: string,
    fromUserId: string
  ): Promise<ServiceResult<Chat | null>> {
    try {
      const client = await this.ensureClient()
      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .eq('service_id', serviceId)
        .eq('initiated_by', fromUserId)
        .limit(1)
        .maybeSingle()

      if (error) return this.handleError(error)
      return { success: true, data: (data as Chat) ?? null }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Abre um chat de interesse em troca (pendente até o dono aceitar).
   */
  public async createServiceInterestChat(
    interestedUserId: string,
    ownerId: string,
    serviceId: string,
    offererServiceId?: string | null
  ): Promise<ServiceResult<Chat>> {
    try {
      const existing = await this.findServiceInterestChat(serviceId, interestedUserId)
      if (!existing.success) return existing as ServiceResult<Chat>
      if (existing.data) {
        return { success: true, data: existing.data }
      }

      const insertData: ChatInsert = {
        participant_1: interestedUserId,
        participant_2: ownerId,
        service_id: serviceId,
        product_id: null,
        status: 'pending',
        initiated_by: interestedUserId,
        offerer_service_id: offererServiceId ?? null,
      }

      return this.create(insertData)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Atualiza o status de um chat de interesse (aceitar / recusar).
   */
  public async updateChatStatus(
    chatId: string,
    userId: string,
    status: Chat['status']
  ): Promise<ServiceResult<Chat>> {
    const participates = await this.userParticipatesInChat(chatId, userId)
    if (!participates) {
      return {
        success: false,
        error: { message: 'Você não tem acesso a este chat', code: 'FORBIDDEN' },
      }
    }

    return this.update(
      chatId,
      { status, updated_at: new Date().toISOString() },
      { partial: true, skipValidation: true }
    )
  }

  /**
   * Chats de troca iniciados pelo usuário (interesses enviados).
   */
  public async getServiceInterestsSent(
    userId: string
  ): Promise<ServiceResult<ChatWithDetails[]>> {
    try {
      const client = await this.ensureClient()
      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .eq('initiated_by', userId)
        .not('service_id', 'is', null)
        .order('updated_at', { ascending: false })

      if (error) return this.handleError(error)
      return {
        success: true,
        data: await this.enrichChats((data || []) as Chat[], userId),
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Chats de interesse nos serviços do usuário (interesses recebidos).
   */
  public async getServiceInterestsReceived(
    userId: string,
    serviceIds: string[]
  ): Promise<ServiceResult<ChatWithDetails[]>> {
    if (serviceIds.length === 0) {
      return { success: true, data: [] }
    }

    try {
      const client = await this.ensureClient()
      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .in('service_id', serviceIds)
        .neq('initiated_by', userId)
        .order('updated_at', { ascending: false })

      if (error) return this.handleError(error)
      return {
        success: true,
        data: await this.enrichChats((data || []) as Chat[], userId),
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  private async enrichChats(chats: Chat[], userId: string): Promise<ChatWithDetails[]> {
    return Promise.all(
      chats.map(async (chat) => {
        const otherParticipantId =
          chat.participant_1 === userId ? chat.participant_2 : chat.participant_1
        const unreadCount = await this.getUnreadCountForChat(chat.id, userId)
        return { ...chat, otherParticipantId, unreadCount }
      })
    )
  }

  private async getUnreadCountForChat(chatId: string, userId: string): Promise<number> {
    try {
      const client = await this.ensureClient()
      const { count, error } = await client
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('chat_id', chatId)
        .eq('read', false)
        .neq('sender_id', userId)

      if (error) return 0
      return count ?? 0
    } catch {
      return 0
    }
  }

  /**
   * Busca chats de um usuário
   */
  public async getUserChats(
    userId: string
  ): Promise<ServiceResult<ChatWithDetails[]>> {
    try {
      const client = await this.ensureClient()

      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (error) {
        return this.handleError(error)
      }

      const chats = (data || []) as Chat[]

      // Adicionar informações extras
      const chatsWithDetails: ChatWithDetails[] = await Promise.all(
        chats.map(async (chat) => {
          const otherParticipantId =
            chat.participant_1 === userId ? chat.participant_2 : chat.participant_1

          // Contar mensagens não lidas
          const { count } = await client
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chat.id)
            .eq('read', false)
            .neq('sender_id', userId)

          return {
            ...chat,
            otherParticipantId,
            unreadCount: count || 0,
          }
        })
      )

      return {
        success: true,
        data: chatsWithDetails,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Busca chat por ID
   */
  public async getChatById(chatId: string): Promise<ServiceResult<Chat>> {
    return this.findById(chatId)
  }

  /**
   * Verifica se usuário participa do chat
   */
  private async userParticipatesInChat(
    chatId: string,
    userId: string
  ): Promise<boolean> {
    const chatResult = await this.findById(chatId)
    if (!chatResult.success || !chatResult.data) {
      return false
    }

    return (
      chatResult.data.participant_1 === userId ||
      chatResult.data.participant_2 === userId
    )
  }

  /**
   * Busca mensagens de um chat
   */
  public async getMessages(
    chatId: string,
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ServiceResult<Message[]>> {
    try {
      // Verificar se usuário participa do chat
      const participates = await this.userParticipatesInChat(chatId, userId)
      if (!participates) {
        return {
          success: false,
          error: {
            message: 'Você não tem acesso a este chat',
            code: 'FORBIDDEN',
          },
        }
      }

      const client = await this.ensureClient()

      const { data, error } = await client
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return this.handleError(error)
      }

      // Inverter ordem para mostrar mais antigas primeiro
      const messages = ((data || []) as Message[]).reverse()

      return {
        success: true,
        data: messages,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Envia uma mensagem
   */
  public async sendMessage(
    chatId: string,
    senderId: string,
    content: string,
    options?: { bypassStatusGuard?: boolean }
  ): Promise<ServiceResult<Message>> {
    try {
      // Verificar se usuário participa do chat
      const participates = await this.userParticipatesInChat(chatId, senderId)
      if (!participates) {
        return {
          success: false,
          error: {
            message: 'Você não tem acesso a este chat',
            code: 'FORBIDDEN',
          },
        }
      }

      const chatResult = await this.findById(chatId)
      if (!options?.bypassStatusGuard && chatResult.success && chatResult.data?.service_id) {
        const chat = chatResult.data
        if (chat.status === 'declined' || chat.status === 'completed') {
          return {
            success: false,
            error: {
              message: 'Esta conversa foi encerrada',
              code: 'CHAT_CLOSED',
            },
          }
        }
        if (chat.status === 'pending' && chat.initiated_by === senderId) {
          return {
            success: false,
            error: {
              message: 'Aguarde a resposta antes de enviar mensagens',
              code: 'CHAT_PENDING',
            },
          }
        }
        if (chat.status === 'pending' && chat.initiated_by !== senderId) {
          return {
            success: false,
            error: {
              message: 'Aceite ou recuse o interesse para continuar',
              code: 'CHAT_AWAITING_REPLY',
            },
          }
        }
      }

      // Validar conteúdo
      if (!content || content.trim().length === 0) {
        return {
          success: false,
          error: {
            message: 'Mensagem não pode estar vazia',
            code: 'EMPTY_MESSAGE',
          },
        }
      }

      if (content.length > 2000) {
        return {
          success: false,
          error: {
            message: 'Mensagem não pode exceder 2000 caracteres',
            code: 'MESSAGE_TOO_LONG',
          },
        }
      }

      const client = await this.ensureClient()

      // Criar mensagem
      const messageData: MessageInsert = {
        chat_id: chatId,
        sender_id: senderId,
        content: content.trim(),
        read: false,
      }

      const { data: message, error: messageError } = await client
        .from('messages')
        .insert(messageData)
        .select()
        .single()

      if (messageError) {
        return this.handleError(messageError)
      }

      // Atualizar last_message do chat
      const updateData: Partial<Chat> = {
        last_message: content.trim(),
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      await this.update(chatId, updateData, { partial: true, skipValidation: true })

      return {
        success: true,
        data: message as Message,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Marca uma mensagem como lida
   */
  public async markAsRead(
    messageId: string,
    userId: string
  ): Promise<ServiceResult<Message>> {
    try {
      const client = await this.ensureClient()

      // Buscar mensagem
      const { data: message, error: fetchError } = await client
        .from('messages')
        .select('*, chat:chats(*)')
        .eq('id', messageId)
        .single()

      if (fetchError) {
        return this.handleError(fetchError)
      }

      if (!message) {
        return {
          success: false,
          error: {
            message: 'Mensagem não encontrada',
            code: 'NOT_FOUND',
          },
        }
      }

      // Verificar se usuário participa do chat
      const participates = await this.userParticipatesInChat(message.chat_id, userId)
      if (!participates) {
        return {
          success: false,
          error: {
            message: 'Você não tem acesso a esta mensagem',
            code: 'FORBIDDEN',
          },
        }
      }

      // Não pode marcar própria mensagem como lida
      if (message.sender_id === userId) {
        return {
          success: true,
          data: message as Message,
        }
      }

      // Atualizar mensagem
      const { data: updatedMessage, error: updateError } = await client
        .from('messages')
        .update({ read: true })
        .eq('id', messageId)
        .select()
        .single()

      if (updateError) {
        return this.handleError(updateError)
      }

      return {
        success: true,
        data: updatedMessage as Message,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Marca todas as mensagens de um chat como lidas
   */
  public async markChatAsRead(
    chatId: string,
    userId: string
  ): Promise<ServiceResult<void>> {
    try {
      // Verificar se usuário participa do chat
      const participates = await this.userParticipatesInChat(chatId, userId)
      if (!participates) {
        return {
          success: false,
          error: {
            message: 'Você não tem acesso a este chat',
            code: 'FORBIDDEN',
          },
        }
      }

      const client = await this.ensureClient()

      // Marcar todas as mensagens não lidas como lidas
      const { error } = await client
        .from('messages')
        .update({ read: true })
        .eq('chat_id', chatId)
        .eq('read', false)
        .neq('sender_id', userId)

      if (error) {
        return this.handleError(error)
      }

      return { success: true }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Deleta um chat e todas suas mensagens
   */
  public async deleteChat(
    chatId: string,
    userId: string
  ): Promise<ServiceResult<void>> {
    try {
      // Verificar se usuário participa do chat
      const participates = await this.userParticipatesInChat(chatId, userId)
      if (!participates) {
        return {
          success: false,
          error: {
            message: 'Você não tem acesso a este chat',
            code: 'FORBIDDEN',
          },
        }
      }

      const client = await this.ensureClient()

      // Deletar mensagens primeiro (cascade)
      const { error: messagesError } = await client
        .from('messages')
        .delete()
        .eq('chat_id', chatId)

      if (messagesError) {
        return this.handleError(messagesError)
      }

      // Deletar chat
      return this.delete(chatId)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Conta mensagens não lidas de um usuário
   */
  public async getUnreadCount(userId: string): Promise<ServiceResult<number>> {
    try {
      const client = await this.ensureClient()

      // Buscar todos os chats do usuário
      const { data: chats, error: chatsError } = await client
        .from(this.tableName as any)
        .select('id')
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)

      if (chatsError) {
        return this.handleError(chatsError)
      }

      if (!chats || chats.length === 0) {
        return { success: true, data: 0 }
      }

      const chatIds = chats.map((c) => c.id)

      // Contar mensagens não lidas
      const { count, error: countError } = await client
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('chat_id', chatIds)
        .eq('read', false)
        .neq('sender_id', userId)

      if (countError) {
        return this.handleError(countError)
      }

      return {
        success: true,
        data: count || 0,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }
}

// Singleton instance
let chatServiceInstance: ChatService | null = null

/**
 * Obtém instância singleton do ChatService
 */
export function getChatService(): ChatService {
  if (!chatServiceInstance) {
    chatServiceInstance = new ChatService()
  }
  return chatServiceInstance
}
