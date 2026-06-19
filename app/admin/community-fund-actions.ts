'use server'

import { revalidatePath } from 'next/cache'
import { getCommunityFundService } from '@/data/community-fund.service'
import { ensureAdmin } from '@/lib/auth/admin'

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Aporte manual no fundo comunitário — só admin da plataforma pode fazer.
 * Fonte de receita do fundo fora desse aporte manual fica fora de escopo
 * por ora (sem desenho de arrecadação ainda).
 */
export async function topUpCommunityFundAction(
  communityId: string,
  amount: number
): Promise<ActionResult<null>> {
  if (!(await ensureAdmin())) {
    return { success: false, error: 'Acesso restrito a administradores' }
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, error: 'Informe um valor positivo' }
  }

  const res = await getCommunityFundService().credit(communityId, amount, 'admin_topup')
  if (!res.success) {
    return { success: false, error: res.error?.message || 'Erro ao adicionar ao fundo' }
  }

  revalidatePath(`/admin/comunidades/${communityId}/editar`)
  return { success: true, data: null }
}
