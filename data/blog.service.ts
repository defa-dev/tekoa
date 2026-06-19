import { BaseService } from './base.service'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ServiceResult } from './types'
import type { BlogPost } from '@/types'

export interface CreatePostInput {
  title: string
  summary: string
  content: string
  coverImage?: string | null
  authorName?: string
  slug?: string
}

export type UpdatePostInput = Partial<CreatePostInput>

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Service do blog (`blog_posts`) — textos próprios do Tekoa.
 *
 * Leitura pública só alcança posts publicados (RLS); leitura de rascunhos
 * é só pra admin. Escrita sempre via admin client, com `ensureAdmin()` já
 * checado na Server Action — RLS aqui é defesa em profundidade, mesmo
 * padrão de `CommunityService`.
 */
export class BlogService extends BaseService<BlogPost> {
  constructor() {
    super('blog_posts')
  }

  protected validate(data: Partial<BlogPost>): ServiceResult<BlogPost> {
    if (data.title !== undefined && data.title.trim().length < 3) {
      return {
        success: false,
        error: { message: 'Título precisa de ao menos 3 caracteres', code: 'INVALID_TITLE' },
      }
    }
    if (data.summary !== undefined && data.summary.trim().length < 10) {
      return {
        success: false,
        error: { message: 'Resumo precisa de ao menos 10 caracteres', code: 'INVALID_SUMMARY' },
      }
    }
    if (data.content !== undefined && data.content.trim().length < 20) {
      return {
        success: false,
        error: { message: 'Conteúdo muito curto', code: 'INVALID_CONTENT' },
      }
    }
    return { success: true, data: data as BlogPost }
  }

  public async createPost(input: CreatePostInput): Promise<ServiceResult<BlogPost>> {
    const validation = this.validate({
      title: input.title,
      summary: input.summary,
      content: input.content,
    })
    if (!validation.success) return validation

    try {
      const slug = slugify(input.slug?.trim() || input.title)
      const admin = createAdminClient()
      const { data, error } = await admin
        .from('blog_posts')
        .insert({
          slug,
          title: input.title.trim(),
          summary: input.summary.trim(),
          content: input.content.trim(),
          cover_image: input.coverImage?.trim() || null,
          author_name: input.authorName?.trim() || 'Equipe Tekoa',
          published_at: null,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          return {
            success: false,
            error: { message: 'Já existe um post com esse link — mude o título ou informe outro slug', code: 'DUPLICATE_SLUG' },
          }
        }
        return this.handleError(error)
      }
      return { success: true, data: data as BlogPost }
    } catch (error) {
      return this.handleError(error)
    }
  }

  public async updatePost(id: string, input: UpdatePostInput): Promise<ServiceResult<BlogPost>> {
    const validation = this.validate({
      title: input.title,
      summary: input.summary,
      content: input.content,
    })
    if (!validation.success) return validation

    try {
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (input.title !== undefined) patch.title = input.title.trim()
      if (input.summary !== undefined) patch.summary = input.summary.trim()
      if (input.content !== undefined) patch.content = input.content.trim()
      if (input.coverImage !== undefined) patch.cover_image = input.coverImage?.trim() || null
      if (input.authorName !== undefined) patch.author_name = input.authorName.trim()
      if (input.slug !== undefined) patch.slug = slugify(input.slug)

      const admin = createAdminClient()
      const { data, error } = await admin
        .from('blog_posts')
        .update(patch)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          return {
            success: false,
            error: { message: 'Já existe um post com esse link — mude o título ou informe outro slug', code: 'DUPLICATE_SLUG' },
          }
        }
        return this.handleError(error)
      }
      return { success: true, data: data as BlogPost }
    } catch (error) {
      return this.handleError(error)
    }
  }

  public async setPublished(id: string, published: boolean): Promise<ServiceResult<BlogPost>> {
    try {
      const admin = createAdminClient()
      const { data, error } = await admin
        .from('blog_posts')
        .update({
          published_at: published ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) return this.handleError(error)
      return { success: true, data: data as BlogPost }
    } catch (error) {
      return this.handleError(error)
    }
  }

  public async deletePost(id: string): Promise<ServiceResult<null>> {
    try {
      const admin = createAdminClient()
      const { error } = await admin.from('blog_posts').delete().eq('id', id)
      if (error) return this.handleError(error)
      return { success: true, data: null }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /** Posts publicados, mais recentes primeiro — uso público. */
  public async getPublishedPosts(limit = 30): Promise<ServiceResult<BlogPost[]>> {
    try {
      const client = await this.ensureClient()
      const { data, error } = await client
        .from('blog_posts')
        .select('*')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(limit)

      if (error) return this.handleError(error)
      return { success: true, data: (data ?? []) as BlogPost[] }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /** Post publicado por slug — uso público (RLS bloqueia rascunho). */
  public async getPostBySlug(slug: string): Promise<ServiceResult<BlogPost | null>> {
    try {
      const client = await this.ensureClient()
      const { data, error } = await client
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .not('published_at', 'is', null)
        .maybeSingle()

      if (error) return this.handleError(error)
      return { success: true, data: data as BlogPost | null }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /** Todos os posts (rascunho + publicado) — uso admin. */
  public async getAllPostsForAdmin(): Promise<ServiceResult<BlogPost[]>> {
    try {
      const admin = createAdminClient()
      const { data, error } = await admin
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) return this.handleError(error)
      return { success: true, data: (data ?? []) as BlogPost[] }
    } catch (error) {
      return this.handleError(error)
    }
  }

  public async getPostById(id: string): Promise<ServiceResult<BlogPost>> {
    try {
      const admin = createAdminClient()
      const { data, error } = await admin
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) return this.handleError(error)
      return { success: true, data: data as BlogPost }
    } catch (error) {
      return this.handleError(error)
    }
  }
}

let blogServiceInstance: BlogService | null = null

export function getBlogService(): BlogService {
  if (!blogServiceInstance) {
    blogServiceInstance = new BlogService()
  }
  return blogServiceInstance
}
