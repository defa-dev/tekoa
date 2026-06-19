'use server'

import { revalidatePath } from 'next/cache'
import { getMutiraoService, type CreateMutiraoData } from '@/data/mutirao.service'
import { getMutiraoMessageService } from '@/data/mutirao-message.service'
import { getAuthUser, getCurrentProfile } from '@/lib/auth/session'

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Cria um pedido de mutirão. Qualquer morador pode organizar — não é
 * exclusivo a causas comunitárias. Aparece dentro de Trocas → Buscam,
 * por isso herda o mesmo território de origem (`community`) do autor.
 */
export async function createMutiraoAction(
  data: CreateMutiraoData
): Promise<ActionResult<{ id: string }>> {
  const profile = await getCurrentProfile()
  if (!profile) return { success: false, error: 'Faça login para continuar' }

  const res = await getMutiraoService().createMutirao(profile.id, {
    ...data,
    community: profile.location,
  })
  if (!res.success) {
    return { success: false, error: res.error?.message || 'Erro ao criar mutirão' }
  }

  revalidatePath('/trocas')
  revalidatePath('/trocas/minhas')
  return { success: true, data: { id: res.data!.id } }
}

/**
 * Confirma presença — entra na lista e no chat em grupo do mutirão.
 */
export async function confirmAttendanceAction(mutiraoId: string): Promise<ActionResult<null>> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Faça login para continuar' }

  const res = await getMutiraoService().confirmAttendance(mutiraoId, user.id)
  if (!res.success) {
    return { success: false, error: res.error?.message || 'Erro ao confirmar presença' }
  }

  revalidatePath(`/mutiroes/${mutiraoId}`)
  revalidatePath('/trocas')
  revalidatePath('/trocas/minhas')
  return { success: true, data: null }
}

export async function cancelMutiraoAction(mutiraoId: string): Promise<ActionResult<null>> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Faça login para continuar' }

  const res = await getMutiraoService().cancelMutirao(mutiraoId, user.id)
  if (!res.success) {
    return { success: false, error: res.error?.message || 'Erro ao cancelar' }
  }

  revalidatePath(`/mutiroes/${mutiraoId}`)
  revalidatePath('/trocas')
  revalidatePath('/trocas/minhas')
  return { success: true, data: null }
}

/**
 * Envia mensagem no chat em grupo do mutirão. Confere participação antes
 * de tentar (organizador ou confirmado) — a RLS garante o mesmo no banco.
 */
export async function sendMutiraoMessageAction(
  mutiraoId: string,
  content: string
): Promise<ActionResult<null>> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Faça login para continuar' }

  const mutiraoRes = await getMutiraoService().getMutiraoById(mutiraoId)
  if (!mutiraoRes.success || !mutiraoRes.data) {
    return { success: false, error: 'Mutirão não encontrado' }
  }

  const isOrganizer = mutiraoRes.data.organizer_id === user.id
  if (!isOrganizer) {
    const confirmationsRes = await getMutiraoService().getConfirmations(mutiraoId)
    const isConfirmed =
      confirmationsRes.success && (confirmationsRes.data ?? []).some((c) => c.user_id === user.id)
    if (!isConfirmed) {
      return { success: false, error: 'Você não participa deste mutirão' }
    }
  }

  const res = await getMutiraoMessageService().sendMessage(mutiraoId, user.id, content)
  if (!res.success) {
    return { success: false, error: res.error?.message || 'Erro ao enviar mensagem' }
  }

  revalidatePath(`/mutiroes/${mutiraoId}`)
  return { success: true, data: null }
}
