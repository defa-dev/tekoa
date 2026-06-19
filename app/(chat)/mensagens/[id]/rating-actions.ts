'use server'

import { revalidatePath } from 'next/cache'
import { getRatingService } from '@/data/rating.service'
import { getTradeService } from '@/data/trade.service'
import { getTekoinService } from '@/data/tekoin.service'
import { getAuthUser } from '@/lib/auth/session'

type ActionResult = { success: true } | { success: false; error: string }

/**
 * Registra a avaliação do usuário atual sobre o outro participante da troca
 * e credita Tekoin a quem foi avaliado (escalado pela nota). `chatId` é
 * necessário pra resolver o `trade_id` de referência do ledger — sem ele a
 * mineração ainda funciona, só fica sem rastro do trade de origem.
 */
export async function rateUserAction(input: {
  chatId?: string
  toUserId: string
  rating: number
  comment?: string
  serviceId?: string | null
  productId?: string | null
}): Promise<ActionResult> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Faça login para continuar' }

  if (input.toUserId === user.id) {
    return { success: false, error: 'Você não pode avaliar a si mesmo' }
  }

  const result = await getRatingService().createRating(user.id, {
    to_user_id: input.toUserId,
    rating: input.rating,
    comment: input.comment?.trim() || null,
    service_id: input.serviceId ?? null,
    product_id: input.productId ?? null,
  })

  if (!result.success) {
    return { success: false, error: result.error?.message || 'Erro ao avaliar' }
  }

  // Mineração de Tekoin não bloqueia a avaliação se falhar — o saldo é
  // reconstruível do ledger e pode ser corrigido depois se necessário.
  try {
    let tradeId: string | null = null
    if (input.chatId) {
      const tradeRes = await getTradeService().getTradeByChat(input.chatId)
      tradeId = tradeRes.success ? tradeRes.data?.id ?? null : null
    }
    await getTekoinService().mintRatingReward(input.toUserId, user.id, input.rating, tradeId)
    await getTekoinService().checkAndAwardBadges(input.toUserId)
  } catch (error) {
    console.error('Erro ao creditar Tekoin pela avaliação:', error)
  }

  revalidatePath('/perfil')
  return { success: true }
}
