'use server'

import { revalidatePath } from 'next/cache'
import { getRatingService } from '@/data/rating.service'
import { getAuthUser } from '@/lib/auth/session'

type ActionResult = { success: true } | { success: false; error: string }

/**
 * Registra a avaliação do usuário atual sobre o outro participante da troca.
 * O id de quem avalia vem da sessão (nunca do cliente).
 */
export async function rateUserAction(input: {
  toUserId: string
  rating: number
  comment?: string
  serviceId?: string | null
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
  })

  if (!result.success) {
    return { success: false, error: result.error?.message || 'Erro ao avaliar' }
  }

  revalidatePath('/perfil')
  return { success: true }
}
