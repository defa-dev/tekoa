'use server'

import { revalidatePath } from 'next/cache'
import { getMuralService, type CreateMuralPostData } from '@/data/mural.service'
import { getTekoinService } from '@/data/tekoin.service'
import { getCurrentProfile } from '@/lib/auth/session'

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Publica um aviso no Mural da comunidade.
 */
export async function createPostAction(
  data: CreateMuralPostData
): Promise<ActionResult<{ id: string }>> {
  const profile = await getCurrentProfile()
  if (!profile) return { success: false, error: 'Faça login para continuar' }

  const result = await getMuralService().createPost(profile.id, {
    ...data,
    community: profile.location,
  })
  if (!result.success) {
    return { success: false, error: result.error?.message || 'Erro ao publicar' }
  }

  // Mineração de Tekoin não bloqueia a publicação se falhar.
  try {
    await getTekoinService().mintAvisoReward(profile.id, result.data!.id)
    await getTekoinService().checkAndAwardBadges(profile.id)
  } catch (error) {
    console.error('Erro ao creditar Tekoin pelo aviso:', error)
  }

  revalidatePath('/avisos')
  revalidatePath('/dashboard')
  return { success: true, data: { id: result.data!.id } }
}
