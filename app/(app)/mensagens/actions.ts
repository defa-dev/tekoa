'use server'

import { revalidatePath } from 'next/cache'
import { getChatService } from '@/data/chat.service'
import { getAuthUser } from '@/lib/auth/session'

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Envia uma mensagem em um chat (o remetente é o usuário autenticado).
 */
export async function sendMessageAction(
  chatId: string,
  content: string
): Promise<ActionResult<{ id: string }>> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Faça login para continuar' }

  const result = await getChatService().sendMessage(chatId, user.id, content)
  if (!result.success) {
    return { success: false, error: result.error?.message || 'Erro ao enviar' }
  }

  revalidatePath(`/mensagens/${chatId}`)
  revalidatePath('/mensagens')
  return { success: true, data: { id: result.data!.id } }
}

/**
 * Marca como lidas as mensagens recebidas em um chat.
 */
export async function markChatReadAction(chatId: string): Promise<ActionResult> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Faça login para continuar' }

  await getChatService().markChatAsRead(chatId, user.id)
  revalidatePath('/mensagens')
  return { success: true, data: null }
}
