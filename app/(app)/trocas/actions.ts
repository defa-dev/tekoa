'use server'

import { revalidatePath } from 'next/cache'
import { getServiceService, type CreateServiceData } from '@/data/service.service'
import { getAuthUser, getCurrentProfile } from '@/lib/auth/session'
import type { ServiceResult } from '@/data/types'

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Cria uma oferta ou pedido de serviço para o usuário autenticado.
 */
export async function createServiceAction(
  data: CreateServiceData
): Promise<ActionResult<{ id: string }>> {
  const profile = await getCurrentProfile()
  if (!profile) return { success: false, error: 'Faça login para continuar' }

  const result = await getServiceService().createService(profile.id, {
    ...data,
    community: profile.location,
  })
  if (!result.success) {
    return { success: false, error: result.error?.message || 'Erro ao criar serviço' }
  }

  revalidatePath('/trocas')
  revalidatePath('/trocas/minhas')
  revalidatePath('/dashboard')
  return { success: true, data: { id: result.data!.id } }
}

/**
 * Atualiza o status de um serviço do usuário (ex.: concluir, cancelar).
 */
export async function updateServiceStatusAction(
  id: string,
  status: 'active' | 'matched' | 'completed' | 'cancelled'
): Promise<ActionResult> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Faça login para continuar' }

  const result = await getServiceService().updateStatus(id, user.id, status)
  if (!result.success) {
    return { success: false, error: result.error?.message || 'Erro ao atualizar' }
  }

  revalidatePath('/trocas')
  revalidatePath('/trocas/minhas')
  return { success: true, data: null }
}

/**
 * Remove um serviço do usuário.
 */
export async function deleteServiceAction(id: string): Promise<ActionResult> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Faça login para continuar' }

  const result: ServiceResult<void> = await getServiceService().deleteService(id, user.id)
  if (!result.success) {
    return { success: false, error: result.error?.message || 'Erro ao remover' }
  }

  revalidatePath('/trocas')
  revalidatePath('/trocas/minhas')
  return { success: true, data: null }
}

/**
 * Demonstra interesse em um serviço: abre (ou reaproveita) uma conversa
 * pendente entre o usuário atual e o dono do serviço.
 */
export async function startServiceChatAction(
  serviceId: string
): Promise<ActionResult<{ chatId: string; existing?: boolean }>> {
  const { startServiceChatAction: start } = await import(
    '@/app/(chat)/mensagens/[id]/interest-actions'
  )
  const res = await start(serviceId)
  if (!res.success) return res
  return {
    success: true,
    data: { chatId: res.data.chatId, existing: res.data.existing },
  }
}
