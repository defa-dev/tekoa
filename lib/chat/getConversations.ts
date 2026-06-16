import { getChatService, type ChatWithDetails } from '@/data/chat.service'
import { getUserService } from '@/data/user.service'
import type { User } from '@/types'

export interface Conversations {
  chats: ChatWithDetails[]
  userMap: Map<string, User>
}

/**
 * Carrega as conversas do usuário já com o mapa de participantes (nome/avatar),
 * para montar a lista de conversas. Compartilhado entre a lista e o thread
 * (layout de duas colunas no desktop).
 */
export async function getConversations(userId: string): Promise<Conversations> {
  const chatsRes = await getChatService().getUserChats(userId)
  const chats = chatsRes.success ? chatsRes.data ?? [] : []

  const otherIds = Array.from(
    new Set(
      chats.map((c) => c.otherParticipantId).filter(Boolean) as string[]
    )
  )
  const usersRes = await getUserService().getUsersByIds(otherIds)
  const userMap = new Map<string, User>(
    (usersRes.success ? usersRes.data ?? [] : []).map((u) => [u.id, u])
  )

  return { chats, userMap }
}
