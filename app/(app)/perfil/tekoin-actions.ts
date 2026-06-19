'use server'

import { getTekoinService } from '@/data/tekoin.service'
import { getTradeService } from '@/data/trade.service'
import { getRatingService } from '@/data/rating.service'
import { getUserService } from '@/data/user.service'
import { getAuthUser } from '@/lib/auth/session'
import type { TekoinTransaction, TradeOutcome } from '@/types'

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Extrato de Tekoins do usuário atual, mais recente primeiro.
 */
export async function getMyTekoinLedgerAction(
  limit = 20,
  offset = 0
): Promise<ActionResult<TekoinTransaction[]>> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Faça login para continuar' }

  const result = await getTekoinService().getLedger(user.id, limit, offset)
  if (!result.success) {
    return { success: false, error: result.error?.message || 'Erro ao buscar extrato' }
  }
  return { success: true, data: result.data ?? [] }
}

export interface PendingRating {
  chatId: string
  tradeId: string
  otherUserId: string
  otherUserName: string
  serviceId: string | null
  productId: string | null
  outcome: TradeOutcome
  closedAt: string
}

/**
 * Trocas/negociações concluídas onde o usuário atual ainda não avaliou o
 * outro participante — é a superfície que substitui o "Avaliar" que existia
 * no chat (removido de lá antes), agora vivendo em /perfil.
 */
export async function getPendingRatingsAction(): Promise<ActionResult<PendingRating[]>> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Faça login para continuar' }

  const tradesRes = await getTradeService().getUserTrades(user.id)
  if (!tradesRes.success) {
    return { success: false, error: tradesRes.error?.message || 'Erro ao buscar trocas' }
  }

  const ratingSvc = getRatingService()
  const ratable = (tradesRes.data ?? []).filter(
    (t) => t.outcome === 'completed' || t.outcome === 'partial'
  )

  const pending: PendingRating[] = []
  for (const trade of ratable) {
    const hasRatedRes = trade.product_id
      ? await ratingSvc.hasRatedProduct(user.id, trade.product_id)
      : trade.service_id
        ? await ratingSvc.hasRatedService(user.id, trade.service_id)
        : { success: true, data: true }

    if (hasRatedRes.success && hasRatedRes.data) continue

    pending.push({
      chatId: trade.chat_id,
      tradeId: trade.id,
      otherUserId: trade.otherParticipantId,
      otherUserName: '',
      serviceId: trade.service_id,
      productId: trade.product_id,
      outcome: trade.outcome,
      closedAt: trade.closed_at,
    })
  }

  if (pending.length === 0) return { success: true, data: [] }

  const otherIds = Array.from(new Set(pending.map((p) => p.otherUserId)))
  const usersRes = await getUserService().getUsersByIds(otherIds)
  const nameById = new Map(
    (usersRes.success ? usersRes.data ?? [] : []).map((u) => [u.id, u.full_name || 'Vizinho(a)'])
  )

  return {
    success: true,
    data: pending.map((p) => ({ ...p, otherUserName: nameById.get(p.otherUserId) || 'Vizinho(a)' })),
  }
}
