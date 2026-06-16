'use server'

import { revalidatePath } from 'next/cache'
import { getServiceService } from '@/data/service.service'
import { getChatService } from '@/data/chat.service'
import { getAuthUser, getCurrentProfile } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildInterestIntro } from '@/lib/services/interest-intro'
import type { ServiceResult } from '@/data/types'

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Demonstra interesse em um serviço: abre chat pendente + mensagem automática.
 */
export async function startServiceChatAction(
  serviceId: string
): Promise<ActionResult<{ chatId: string; existing: boolean }>> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Faça login para continuar' }

  const profile = await getCurrentProfile()
  const svc = getServiceService()
  const chatSvc = getChatService()

  const svcRes = await svc.getServiceById(serviceId)
  if (!svcRes.success || !svcRes.data) {
    return { success: false, error: 'Serviço não encontrado' }
  }
  const service = svcRes.data
  if (service.user_id === user.id) {
    return { success: false, error: 'Este serviço é seu' }
  }
  if (service.status !== 'active') {
    return { success: false, error: 'Este serviço não está mais disponível' }
  }

  const existing = await chatSvc.findServiceInterestChat(serviceId, user.id)
  if (!existing.success) {
    return { success: false, error: existing.error?.message || 'Erro ao buscar conversa' }
  }
  if (existing.data) {
    if (existing.data.status === 'declined') {
      return {
        success: false,
        error: 'Seu interesse anterior foi recusado. A oferta continua aberta para outros.',
      }
    }
    return { success: true, data: { chatId: existing.data.id, existing: true } }
  }

  const mineRes = await svc.getUserServices(user.id, 'active')
  const myServices = mineRes.success ? mineRes.data ?? [] : []
  const offers = myServices.filter((s) => s.type === 'offer')
  const primaryOffer = offers[0]

  const chat = await chatSvc.createServiceInterestChat(
    user.id,
    service.user_id,
    serviceId,
    primaryOffer?.id ?? null
  )
  if (!chat.success || !chat.data) {
    return { success: false, error: chat.error?.message || 'Erro ao abrir conversa' }
  }

  const intro = buildInterestIntro(
    profile?.full_name || 'Um vizinho',
    service.title,
    myServices.map((s) => ({ title: s.title, type: s.type }))
  )

  const msg = await chatSvc.sendMessage(chat.data.id, user.id, intro, {
    bypassStatusGuard: true,
  })
  if (!msg.success) {
    return { success: false, error: msg.error?.message || 'Erro ao enviar mensagem' }
  }

  revalidatePath('/mensagens')
  revalidatePath('/trocas')
  revalidatePath('/trocas/minhas')
  return { success: true, data: { chatId: chat.data.id, existing: false } }
}

/**
 * Dono do serviço aceita o interesse — libera a conversa.
 */
export async function acceptServiceInterestAction(
  chatId: string
): Promise<ActionResult> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Faça login para continuar' }

  const chatSvc = getChatService()
  const chatRes = await chatSvc.getChatById(chatId)
  if (!chatRes.success || !chatRes.data) {
    return { success: false, error: 'Conversa não encontrada' }
  }
  const chat = chatRes.data

  if (!chat.service_id || chat.status !== 'pending') {
    return { success: false, error: 'Não há interesse pendente nesta conversa' }
  }
  if (chat.initiated_by === user.id) {
    return { success: false, error: 'Apenas quem recebeu o interesse pode aceitar' }
  }

  const svcRes = await getServiceService().getServiceById(chat.service_id)
  if (!svcRes.success || svcRes.data?.user_id !== user.id) {
    return { success: false, error: 'Você não pode aceitar este interesse' }
  }

  const updated = await chatSvc.updateChatStatus(chatId, user.id, 'active')
  if (!updated.success) {
    return { success: false, error: updated.error?.message || 'Erro ao aceitar' }
  }

  // Serviço vai para 'matched': não aparece mais para novos interessados
  await createAdminClient()
    .from('services')
    .update({ status: 'matched' })
    .eq('id', chat.service_id)

  const profile = await getCurrentProfile()
  const name = profile?.full_name?.split(' ')[0] || 'Eu'
  await chatSvc.sendMessage(
    chatId,
    user.id,
    `${name} aceitou seu interesse! Vamos combinar os detalhes da troca.`
  )

  revalidatePath(`/mensagens/${chatId}`)
  revalidatePath('/mensagens')
  revalidatePath('/trocas')
  revalidatePath('/trocas/minhas')
  return { success: true, data: null }
}

/**
 * Dono do serviço recusa o interesse (a oferta continua aberta).
 */
export async function declineServiceInterestAction(
  chatId: string
): Promise<ActionResult> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Faça login para continuar' }

  const chatSvc = getChatService()
  const chatRes = await chatSvc.getChatById(chatId)
  if (!chatRes.success || !chatRes.data) {
    return { success: false, error: 'Conversa não encontrada' }
  }
  const chat = chatRes.data

  if (!chat.service_id || chat.status !== 'pending') {
    return { success: false, error: 'Não há interesse pendente nesta conversa' }
  }
  if (chat.initiated_by === user.id) {
    return { success: false, error: 'Apenas quem recebeu o interesse pode recusar' }
  }

  const svcRes = await getServiceService().getServiceById(chat.service_id)
  if (!svcRes.success || svcRes.data?.user_id !== user.id) {
    return { success: false, error: 'Você não pode recusar este interesse' }
  }

  const updated = await chatSvc.updateChatStatus(chatId, user.id, 'declined')
  if (!updated.success) {
    return { success: false, error: updated.error?.message || 'Erro ao recusar' }
  }

  const profile = await getCurrentProfile()
  const name = profile?.full_name?.split(' ')[0] || 'Eu'
  await chatSvc.sendMessage(
    chatId,
    user.id,
    `${name} não pode combinar essa troca agora. A oferta continua na roda para outros vizinhos.`,
    { bypassStatusGuard: true }
  )

  revalidatePath(`/mensagens/${chatId}`)
  revalidatePath('/mensagens')
  revalidatePath('/trocas/minhas')
  return { success: true, data: null }
}
