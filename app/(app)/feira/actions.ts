'use server'

import { revalidatePath } from 'next/cache'
import { getProductService, type CreateProductData } from '@/data/product.service'
import { getChatService } from '@/data/chat.service'
import { getAuthUser, getCurrentProfile } from '@/lib/auth/session'
import { buildNegotiateIntro } from '@/lib/products/negotiate-intro'

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Publica um produto na Feira do Rolo.
 */
export async function createProductAction(
  data: CreateProductData
): Promise<ActionResult<{ id: string }>> {
  const profile = await getCurrentProfile()
  if (!profile) return { success: false, error: 'Faça login para continuar' }

  if (!data.images || data.images.length === 0) {
    return { success: false, error: 'Adicione ao menos uma foto do produto' }
  }

  const result = await getProductService().createProduct(profile.id, {
    ...data,
    community: profile.location,
  })
  if (!result.success) {
    return { success: false, error: result.error?.message || 'Erro ao publicar' }
  }

  revalidatePath('/feira')
  revalidatePath('/dashboard')
  return { success: true, data: { id: result.data!.id } }
}

/**
 * Atualiza o status de um produto do usuário (disponível/reservado/vendido).
 */
export async function updateProductStatusAction(
  id: string,
  status: 'available' | 'reserved' | 'sold'
): Promise<ActionResult> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Faça login para continuar' }

  const result = await getProductService().updateStatus(id, user.id, status)
  if (!result.success) {
    return { success: false, error: result.error?.message || 'Erro ao atualizar' }
  }

  revalidatePath('/feira')
  revalidatePath(`/feira/${id}`)
  return { success: true, data: null }
}

/**
 * Inicia (ou reaproveita) uma conversa de negociação sobre um produto.
 */
export async function startProductChatAction(
  productId: string
): Promise<ActionResult<{ chatId: string }>> {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'Faça login para continuar' }

  const prod = await getProductService().getProductById(productId)
  if (!prod.success) return { success: false, error: 'Produto não encontrado' }

  const ownerId = prod.data!.user_id
  if (ownerId === user.id) {
    return { success: false, error: 'Este produto é seu' }
  }

  const chatRes = await getChatService().createChat(user.id, ownerId, null, productId)
  if (!chatRes.success) {
    return { success: false, error: chatRes.error?.message || 'Erro ao abrir conversa' }
  }
  const { chat, existing } = chatRes.data!

  if (!existing) {
    const intro = buildNegotiateIntro(prod.data!.title, productId)
    await getChatService().sendMessage(chat.id, user.id, intro, { bypassStatusGuard: true })
  }

  revalidatePath('/mensagens')
  return { success: true, data: { chatId: chat.id } }
}
