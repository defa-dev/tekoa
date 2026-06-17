'use server'

import { revalidatePath } from 'next/cache'
import { getChatService } from '@/data/chat.service'
import { getTradeService } from '@/data/trade.service'
import { getAuthUser, getCurrentProfile } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import type { TradeOutcome } from '@/types'

type ActionResult = { success: true } | { success: false; error: string }

/**
 * Encerra uma troca com um desfecho explícito.
 *
 * completed → serviço concluído, recomenda avaliação
 * partial   → serviço concluído, mas não foi ideal
 * cancelled → serviço volta para a roda (active)
 *
 * Em todos os casos o chat vai para 'completed' (somente leitura).
 */
export async function closeTradeAction(
  chatId: string,
  outcome: TradeOutcome
): Promise<ActionResult> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Faça login para continuar' }

  const chatSvc = getChatService()
  const chatRes = await chatSvc.getChatById(chatId)
  if (!chatRes.success || !chatRes.data) {
    return { success: false, error: 'Conversa não encontrada' }
  }
  const chat = chatRes.data

  if (chat.participant_1 !== user.id && chat.participant_2 !== user.id) {
    return { success: false, error: 'Acesso negado' }
  }
  if (chat.status !== 'active') {
    return { success: false, error: 'Esta conversa não pode ser encerrada' }
  }
  if (!chat.service_id) {
    return { success: false, error: 'Apenas trocas de serviço podem ser encerradas aqui' }
  }

  const admin = createAdminClient()

  const serviceStatus = outcome === 'cancelled' ? 'active' : 'completed'
  await admin.from('services').update({ status: serviceStatus }).eq('id', chat.service_id)

  const updated = await chatSvc.updateChatStatus(chatId, user.id, 'completed')
  if (!updated.success) {
    return { success: false, error: updated.error?.message || 'Erro ao encerrar' }
  }

  const profile = await getCurrentProfile()
  const name = profile?.full_name?.split(' ')[0] || 'Alguém'

  const systemMessage =
    outcome === 'completed'
      ? `${name} marcou a troca como concluída!`
      : outcome === 'partial'
        ? `${name} encerrou a troca.`
        : `${name} encerrou a combinação. A oferta voltou para a roda dos vizinhos.`

  await chatSvc.sendMessage(chatId, user.id, systemMessage, { bypassStatusGuard: true })

  // Registra a troca como entidade própria para histórico
  await getTradeService().createTrade({
    chat_id: chatId,
    service_id: chat.service_id,
    participant_1: chat.participant_1,
    participant_2: chat.participant_2,
    closed_by: user.id,
    outcome,
  })

  revalidatePath(`/mensagens/${chatId}`)
  revalidatePath('/mensagens')
  revalidatePath('/trocas')
  revalidatePath('/trocas/minhas')
  return { success: true }
}
