'use server'

import { revalidatePath } from 'next/cache'
import { getChatService } from '@/data/chat.service'
import { getTradeService } from '@/data/trade.service'
import { getProductService } from '@/data/product.service'
import { getTekoinService } from '@/data/tekoin.service'
import { getAuthUser, getCurrentProfile } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import type { TradeOutcome } from '@/types'

type ActionResult = { success: true } | { success: false; error: string }

/**
 * Encerra uma troca (serviço) ou negociação (produto) com um desfecho explícito.
 *
 * Serviço:
 *   completed/partial → serviço concluído
 *   cancelled          → serviço volta para a roda (active)
 * Produto:
 *   completed/partial → produto marcado como vendido
 *   cancelled          → produto volta a ficar disponível na feira
 *
 * Em todos os casos o chat vai para 'completed' (somente leitura).
 *
 * `tekoinsOffered` (só produto, fora de cancelled) transfere Tekoin de quem
 * fechou pro outro lado da negociação — bloqueia o encerramento se o saldo
 * for insuficiente, já que é dinheiro de verdade saindo do bolso de alguém.
 */
export async function closeTradeAction(
  chatId: string,
  outcome: TradeOutcome,
  tekoinsOffered?: number
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
  if (!chat.service_id && !chat.product_id) {
    return { success: false, error: 'Esta conversa não pode ser encerrada aqui' }
  }

  const isProduct = !!chat.product_id
  const admin = createAdminClient()

  if (isProduct) {
    const productStatus = outcome === 'cancelled' ? 'available' : 'sold'
    await admin.from('products').update({ status: productStatus }).eq('id', chat.product_id)
  } else {
    const serviceStatus = outcome === 'cancelled' ? 'active' : 'completed'
    await admin.from('services').update({ status: serviceStatus }).eq('id', chat.service_id)
  }

  if (isProduct && outcome !== 'cancelled' && tekoinsOffered && tekoinsOffered > 0) {
    const productRes = await getProductService().getProductById(chat.product_id!)
    if (productRes.success && productRes.data) {
      const sellerId = productRes.data.user_id
      const buyerId = chat.participant_1 === sellerId ? chat.participant_2 : chat.participant_1
      const donateRes = await getTekoinService().donateOnFeira(
        buyerId,
        sellerId,
        tekoinsOffered,
        chat.product_id!
      )
      if (!donateRes.success) {
        return { success: false, error: donateRes.error?.message || 'Erro ao pagar com Tekoins' }
      }
    }
  }

  const updated = await chatSvc.updateChatStatus(chatId, user.id, 'completed')
  if (!updated.success) {
    return { success: false, error: updated.error?.message || 'Erro ao encerrar' }
  }

  const profile = await getCurrentProfile()
  const name = profile?.full_name?.split(' ')[0] || 'Alguém'

  const systemMessage = isProduct
    ? outcome === 'cancelled'
      ? `${name} encerrou a negociação. O produto continua disponível na feira.`
      : `${name} marcou a negociação como concluída — vendido!`
    : outcome === 'completed'
      ? `${name} marcou a troca como concluída!`
      : outcome === 'partial'
        ? `${name} encerrou a troca.`
        : `${name} encerrou a combinação. A oferta voltou para a roda dos vizinhos.`

  await chatSvc.sendMessage(chatId, user.id, systemMessage, { bypassStatusGuard: true })

  // Registra a troca/negociação como entidade própria para histórico
  await getTradeService().createTrade({
    chat_id: chatId,
    service_id: chat.service_id,
    product_id: chat.product_id,
    participant_1: chat.participant_1,
    participant_2: chat.participant_2,
    closed_by: user.id,
    outcome,
  })

  revalidatePath(`/mensagens/${chatId}`)
  revalidatePath('/mensagens')
  revalidatePath('/trocas')
  revalidatePath('/trocas/minhas')
  if (isProduct) {
    revalidatePath('/feira')
    revalidatePath(`/feira/${chat.product_id}`)
  }
  return { success: true }
}
