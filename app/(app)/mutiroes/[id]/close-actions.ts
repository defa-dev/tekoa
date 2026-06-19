'use server'

import { revalidatePath } from 'next/cache'
import { getMutiraoPayoutService, type AttendanceRating } from '@/data/mutirao-payout.service'
import { getMutiraoService } from '@/data/mutirao.service'
import { getTekoinService } from '@/data/tekoin.service'
import { getAuthUser } from '@/lib/auth/session'

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Organizador fecha a lista de presença e avalia cada participante —
 * dispara o Tekoin base (incondicional) e tenta o extra do fundo
 * comunitário, se houver e o organizador for admin da comunidade.
 */
export async function closeMutiraoAction(
  mutiraoId: string,
  attendance: AttendanceRating[],
  extraOffered = 0
): Promise<ActionResult<null>> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Faça login para continuar' }

  const res = await getMutiraoPayoutService().closeMutirao(mutiraoId, user.id, attendance, extraOffered)
  if (!res.success) {
    return { success: false, error: res.error?.message || 'Erro ao fechar mutirão' }
  }

  revalidatePath(`/mutiroes/${mutiraoId}`)
  revalidatePath('/trocas')
  revalidatePath('/perfil')
  return { success: true, data: null }
}

/**
 * Participante avalia o organizador de volta — mesma mecânica de avaliação
 * mútua da troca 1:1, espelhada aqui pro mutirão.
 */
export async function rateOrganizerAction(
  mutiraoId: string,
  rating: number
): Promise<ActionResult<null>> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Faça login para continuar' }

  const mutiraoRes = await getMutiraoService().getMutiraoById(mutiraoId)
  if (!mutiraoRes.success || !mutiraoRes.data) {
    return { success: false, error: 'Mutirão não encontrado' }
  }
  if (mutiraoRes.data.status !== 'completed') {
    return { success: false, error: 'Este mutirão ainda não foi concluído' }
  }
  if (mutiraoRes.data.organizer_id === user.id) {
    return { success: false, error: 'Você não pode avaliar a si mesmo' }
  }

  const alreadyRated = await getTekoinService().hasMutiraoRating(
    mutiraoId,
    mutiraoRes.data.organizer_id,
    user.id
  )
  if (alreadyRated.success && alreadyRated.data) {
    return { success: false, error: 'Você já avaliou o organizador deste mutirão' }
  }

  const res = await getTekoinService().mintMutiraoBaseReward(
    mutiraoRes.data.organizer_id,
    user.id,
    rating,
    mutiraoId
  )
  if (!res.success) {
    return { success: false, error: res.error?.message || 'Erro ao avaliar organizador' }
  }

  revalidatePath(`/mutiroes/${mutiraoId}`)
  return { success: true, data: null }
}
