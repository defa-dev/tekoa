'use server'

import { revalidatePath } from 'next/cache'
import { getMuralService, type CreateMuralPostData } from '@/data/mural.service'
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

  revalidatePath('/avisos')
  revalidatePath('/dashboard')
  return { success: true, data: { id: result.data!.id } }
}
