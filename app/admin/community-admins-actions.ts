'use server'

import { revalidatePath } from 'next/cache'
import { getCommunityAdminService } from '@/data/community-admin.service'
import { getUserService } from '@/data/user.service'
import { ensureAdmin } from '@/lib/auth/admin'
import { getCurrentProfile } from '@/lib/auth/session'

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Atribui o papel de admin de uma comunidade a um morador, por e-mail.
 * Só admin da plataforma pode fazer isso (eleição por voto fica pra depois).
 */
export async function assignCommunityAdminAction(
  communityId: string,
  userEmail: string
): Promise<ActionResult<null>> {
  if (!(await ensureAdmin())) {
    return { success: false, error: 'Acesso restrito a administradores' }
  }
  const platformAdmin = await getCurrentProfile()
  if (!platformAdmin) return { success: false, error: 'Faça login para continuar' }

  const userRes = await getUserService().getUserByEmail(userEmail)
  if (!userRes.success || !userRes.data) {
    return { success: false, error: 'Usuário não encontrado com esse e-mail' }
  }

  const res = await getCommunityAdminService().assignAdmin(
    communityId,
    userRes.data.id,
    platformAdmin.id
  )
  if (!res.success) {
    return { success: false, error: res.error?.message || 'Erro ao atribuir admin' }
  }

  revalidatePath(`/admin/comunidades/${communityId}/editar`)
  return { success: true, data: null }
}
