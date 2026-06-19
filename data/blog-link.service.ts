import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { ServiceResult } from './types'
import type { BlogLink } from '@/types'

export interface CreateLinkInput {
  title: string
  source: string
  url: string
  note?: string | null
}

/**
 * Curadoria de leituras externas (Teia dos Povos, revista Piauí...) —
 * `blog_links` aponta pra fora, nunca reproduz o texto da fonte. Leitura
 * pública; escrita só admin (RLS + `ensureAdmin()` na action).
 */
class BlogLinkService {
  public async getLinks(): Promise<ServiceResult<BlogLink[]>> {
    try {
      const client = await createClient()
      const { data, error } = await client
        .from('blog_links')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) return { success: false, error: { message: error.message, code: error.code } }
      return { success: true, data: (data ?? []) as BlogLink[] }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return { success: false, error: { message } }
    }
  }

  public async createLink(
    addedBy: string,
    input: CreateLinkInput
  ): Promise<ServiceResult<BlogLink>> {
    if (!input.title.trim() || !input.source.trim() || !input.url.trim()) {
      return {
        success: false,
        error: { message: 'Título, fonte e URL são obrigatórios', code: 'INVALID_INPUT' },
      }
    }
    try {
      new URL(input.url.trim())
    } catch {
      return { success: false, error: { message: 'URL inválida', code: 'INVALID_URL' } }
    }

    try {
      const admin = createAdminClient()
      const { data, error } = await admin
        .from('blog_links')
        .insert({
          title: input.title.trim(),
          source: input.source.trim(),
          url: input.url.trim(),
          note: input.note?.trim() || null,
          added_by: addedBy,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          return {
            success: false,
            error: { message: 'Esse link já foi indicado antes', code: 'DUPLICATE_URL' },
          }
        }
        return { success: false, error: { message: error.message, code: error.code } }
      }
      return { success: true, data: data as BlogLink }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return { success: false, error: { message } }
    }
  }

  public async deleteLink(id: string): Promise<ServiceResult<null>> {
    try {
      const admin = createAdminClient()
      const { error } = await admin.from('blog_links').delete().eq('id', id)
      if (error) return { success: false, error: { message: error.message, code: error.code } }
      return { success: true, data: null }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return { success: false, error: { message } }
    }
  }
}

let blogLinkServiceInstance: BlogLinkService | null = null

export function getBlogLinkService(): BlogLinkService {
  if (!blogLinkServiceInstance) {
    blogLinkServiceInstance = new BlogLinkService()
  }
  return blogLinkServiceInstance
}
