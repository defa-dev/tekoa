'use server'

import { revalidatePath } from 'next/cache'
import { getTekoinService } from '@/data/tekoin.service'
import { getServiceService } from '@/data/service.service'
import { getProductService } from '@/data/product.service'
import { getAuthUser } from '@/lib/auth/session'

type ActionResult = { success: true } | { success: false; error: string }

type BoostTarget = { serviceId?: string | null; productId?: string | null }

async function assertOwnsTarget(userId: string, target: BoostTarget): Promise<string | null> {
  if (target.serviceId) {
    const res = await getServiceService().getServiceById(target.serviceId)
    if (!res.success || res.data?.user_id !== userId) return 'Você não é o dono deste anúncio'
    return null
  }
  if (target.productId) {
    const res = await getProductService().getProductById(target.productId)
    if (!res.success || res.data?.user_id !== userId) return 'Você não é o dono deste anúncio'
    return null
  }
  return 'Escolha um anúncio para destacar'
}

/**
 * Gasta Tekoin pra destacar um anúncio próprio por alguns dias.
 */
export async function highlightListingAction(target: BoostTarget): Promise<ActionResult> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Faça login para continuar' }

  const ownershipError = await assertOwnsTarget(user.id, target)
  if (ownershipError) return { success: false, error: ownershipError }

  const res = await getTekoinService().spendOnBoost(user.id, 'highlight', target)
  if (!res.success) return { success: false, error: res.error?.message || 'Erro ao destacar anúncio' }

  revalidatePath('/trocas')
  revalidatePath('/feira')
  revalidatePath('/perfil')
  return { success: true }
}

/**
 * Gasta Tekoin pra priorizar um anúncio próprio nos resultados por alguns dias.
 */
export async function priorityListingAction(target: BoostTarget): Promise<ActionResult> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Faça login para continuar' }

  const ownershipError = await assertOwnsTarget(user.id, target)
  if (ownershipError) return { success: false, error: ownershipError }

  const res = await getTekoinService().spendOnBoost(user.id, 'priority', target)
  if (!res.success) return { success: false, error: res.error?.message || 'Erro ao priorizar anúncio' }

  revalidatePath('/trocas')
  revalidatePath('/feira')
  revalidatePath('/perfil')
  return { success: true }
}
