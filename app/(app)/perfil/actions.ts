'use server'

import { revalidatePath } from 'next/cache'
import { getUserService, type UserProfile } from '@/data/user.service'
import { getAuthUser } from '@/lib/auth/session'
import type { ServiceResult } from '@/data/types'
import type { User } from '@/types'

/**
 * Atualiza o perfil do usuário autenticado.
 * Só permite editar o próprio perfil (deriva o id da sessão).
 */
export async function updateMyProfile(
  profile: UserProfile
): Promise<ServiceResult<User>> {
  const user = await getAuthUser()
  if (!user) {
    return {
      success: false,
      error: { message: 'Usuário não autenticado', code: 'NOT_AUTHENTICATED' },
    }
  }

  const result = await getUserService().updateProfile(user.id, profile)

  if (result.success) {
    revalidatePath('/perfil')
    revalidatePath('/dashboard')
  }

  return result as ServiceResult<User>
}
