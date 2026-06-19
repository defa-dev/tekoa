'use server'

import { revalidatePath } from 'next/cache'
import { getBlogService, type CreatePostInput, type UpdatePostInput } from '@/data/blog.service'
import { getBlogLinkService, type CreateLinkInput } from '@/data/blog-link.service'
import { ensureAdmin } from '@/lib/auth/admin'
import { getCurrentProfile } from '@/lib/auth/session'

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createBlogPostAction(
  input: CreatePostInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  if (!(await ensureAdmin())) {
    return { success: false, error: 'Acesso restrito a administradores' }
  }
  const res = await getBlogService().createPost(input)
  if (!res.success) {
    return { success: false, error: res.error?.message || 'Erro ao criar post' }
  }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  return { success: true, data: { id: res.data!.id, slug: res.data!.slug } }
}

export async function updateBlogPostAction(
  id: string,
  input: UpdatePostInput
): Promise<ActionResult<null>> {
  if (!(await ensureAdmin())) {
    return { success: false, error: 'Acesso restrito a administradores' }
  }
  const res = await getBlogService().updatePost(id, input)
  if (!res.success) {
    return { success: false, error: res.error?.message || 'Erro ao salvar' }
  }

  revalidatePath('/admin/blog')
  revalidatePath(`/admin/blog/${id}/editar`)
  revalidatePath('/blog')
  revalidatePath(`/blog/${res.data!.slug}`)
  return { success: true, data: null }
}

export async function togglePublishBlogPostAction(
  id: string,
  published: boolean
): Promise<ActionResult<null>> {
  if (!(await ensureAdmin())) {
    return { success: false, error: 'Acesso restrito a administradores' }
  }
  const res = await getBlogService().setPublished(id, published)
  if (!res.success) {
    return { success: false, error: res.error?.message || 'Erro ao atualizar' }
  }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  revalidatePath(`/blog/${res.data!.slug}`)
  return { success: true, data: null }
}

export async function deleteBlogPostAction(id: string): Promise<ActionResult<null>> {
  if (!(await ensureAdmin())) {
    return { success: false, error: 'Acesso restrito a administradores' }
  }
  const res = await getBlogService().deletePost(id)
  if (!res.success) {
    return { success: false, error: res.error?.message || 'Erro ao remover' }
  }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  return { success: true, data: null }
}

export async function createBlogLinkAction(
  input: CreateLinkInput
): Promise<ActionResult<{ id: string }>> {
  if (!(await ensureAdmin())) {
    return { success: false, error: 'Acesso restrito a administradores' }
  }
  const profile = await getCurrentProfile()
  if (!profile) return { success: false, error: 'Faça login para continuar' }

  const res = await getBlogLinkService().createLink(profile.id, input)
  if (!res.success) {
    return { success: false, error: res.error?.message || 'Erro ao adicionar indicação' }
  }

  revalidatePath('/admin/blog/links')
  revalidatePath('/blog')
  return { success: true, data: { id: res.data!.id } }
}

export async function deleteBlogLinkAction(id: string): Promise<ActionResult<null>> {
  if (!(await ensureAdmin())) {
    return { success: false, error: 'Acesso restrito a administradores' }
  }
  const res = await getBlogLinkService().deleteLink(id)
  if (!res.success) {
    return { success: false, error: res.error?.message || 'Erro ao remover' }
  }

  revalidatePath('/admin/blog/links')
  revalidatePath('/blog')
  return { success: true, data: null }
}
