import { BaseService } from './base.service'
import { territoryOrFilter } from '@/lib/territories'
import type { ServiceResult, BaseFilters, PaginatedResult } from './types'
import type { Database } from '@/types/database.types'

type MuralPost = Database['public']['Tables']['mural_posts']['Row']
type MuralPostInsert = Database['public']['Tables']['mural_posts']['Insert']
type MuralPostUpdate = Database['public']['Tables']['mural_posts']['Update']

/**
 * Filtros específicos para posts do mural
 */
export interface MuralPostFilters extends BaseFilters {
  type?: MuralPost['type']
  userId?: string
  searchQuery?: string
  viewerCommunity?: string | null
  allTerritories?: boolean
}

/**
 * Dados para criação de post
 */
export interface CreateMuralPostData {
  title: string
  content: string
  type?: MuralPost['type']
  images?: string[]
  community?: string | null
  reach?: string
  reach_communities?: string[]
}

/** Autor resumido anexado a um post. */
export interface MuralAuthor {
  id: string
  full_name: string | null
  location: string | null
  avatar_url: string | null
}

/** Post com o autor embutido (via join). */
export interface MuralPostWithUser extends MuralPost {
  user: MuralAuthor | null
}

/**
 * Service para gerenciar posts do Mural de Avisos
 * 
 * Responsável por:
 * - CRUD de posts
 * - Filtros e busca de posts
 * - Upload de imagens
 * - Listagem por tipo (announcement, event, general)
 */
export class MuralService extends BaseService<MuralPost> {
  constructor() {
    super('mural_posts')
  }

  /**
   * Valida dados do post
   */
  protected validate(data: Partial<MuralPost>): ServiceResult<MuralPost> {
    // Título é obrigatório e deve ter no mínimo 3 caracteres
    if (data.title !== undefined) {
      if (!data.title || data.title.trim().length < 3) {
        return {
          success: false,
          error: {
            message: 'Título deve ter no mínimo 3 caracteres',
            code: 'INVALID_TITLE',
          },
        }
      }

      if (data.title.length > 150) {
        return {
          success: false,
          error: {
            message: 'Título não pode exceder 150 caracteres',
            code: 'TITLE_TOO_LONG',
          },
        }
      }
    }

    // Conteúdo é obrigatório e deve ter no mínimo 10 caracteres
    if (data.content !== undefined) {
      if (!data.content || data.content.trim().length < 10) {
        return {
          success: false,
          error: {
            message: 'Conteúdo deve ter no mínimo 10 caracteres',
            code: 'INVALID_CONTENT',
          },
        }
      }

      if (data.content.length > 5000) {
        return {
          success: false,
          error: {
            message: 'Conteúdo não pode exceder 5000 caracteres',
            code: 'CONTENT_TOO_LONG',
          },
        }
      }
    }

    // Validar tipo
    const validTypes: MuralPost['type'][] = ['announcement', 'event', 'general']
    if (data.type !== undefined && !validTypes.includes(data.type)) {
      return {
        success: false,
        error: {
          message: 'Tipo inválido',
          code: 'INVALID_TYPE',
        },
      }
    }

    // Validar array de imagens
    if (data.images !== undefined && !Array.isArray(data.images)) {
      return {
        success: false,
        error: {
          message: 'Imagens deve ser um array',
          code: 'INVALID_IMAGES',
        },
      }
    }

    return { success: true, data: data as MuralPost }
  }

  /**
   * Cria um novo post no mural
   */
  public async createPost(
    userId: string,
    postData: CreateMuralPostData
  ): Promise<ServiceResult<MuralPost>> {
    try {
      const insertData: MuralPostInsert = {
        user_id: userId,
        title: postData.title,
        content: postData.content,
        type: postData.type || 'general',
        images: postData.images || [],
        community: postData.community ?? null,
        reach: postData.reach ?? 'own',
        reach_communities: postData.reach_communities ?? [],
      }

      return this.create(insertData)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Lista posts com filtros
   */
  public async getPosts(
    filters?: MuralPostFilters
  ): Promise<ServiceResult<PaginatedResult<MuralPost>>> {
    try {
      const client = await this.ensureClient()

      let query = client
        .from(this.tableName as any)
        .select('*', { count: 'exact' })

      // Aplicar filtros
      if (filters?.type) {
        query = query.eq('type', filters.type)
      }

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId)
      }

      if (filters?.searchQuery) {
        query = query.or(
          `title.ilike.%${filters.searchQuery}%,content.ilike.%${filters.searchQuery}%`
        )
      }

      // Aplicar ordenação
      if (filters?.orderBy) {
        query = query.order(filters.orderBy, {
          ascending: filters.orderDirection === 'asc',
        })
      } else {
        // Ordenação padrão: mais recentes primeiro
        query = query.order('created_at', { ascending: false })
      }

      // Aplicar paginação
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }
      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1
        )
      }

      const { data, error, count } = await query

      if (error) {
        return this.handleError(error)
      }

      return {
        success: true,
        data: {
          data: (data || []) as MuralPost[],
          count: count || 0,
          hasMore: filters?.limit
            ? (filters.offset || 0) + (filters.limit || 0) < (count || 0)
            : false,
          offset: filters?.offset || 0,
        },
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Busca post por ID
   */
  public async getPostById(id: string): Promise<ServiceResult<MuralPost>> {
    return this.findById(id)
  }

  /**
   * Lista posts já com o autor embutido (join com users).
   */
  public async getPostsWithUser(
    filters?: MuralPostFilters
  ): Promise<ServiceResult<MuralPostWithUser[]>> {
    try {
      const client = await this.ensureClient()

      let query = client
        .from(this.tableName as any)
        .select('*, user:users(id, full_name, location, avatar_url)')

      if (filters?.type) query = query.eq('type', filters.type)
      if (filters?.userId) query = query.eq('user_id', filters.userId)
      if (filters?.searchQuery) {
        query = query.or(
          `title.ilike.%${filters.searchQuery}%,content.ilike.%${filters.searchQuery}%`
        )
      }
      if (filters?.viewerCommunity && !filters?.allTerritories) {
        query = query.or(territoryOrFilter(filters.viewerCommunity))
      }

      query = query.order('created_at', { ascending: false })
      if (filters?.limit) query = query.limit(filters.limit)

      const { data, error } = await query
      if (error) return this.handleError(error)

      return { success: true, data: (data || []) as unknown as MuralPostWithUser[] }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Atualiza um post
   */
  public async updatePost(
    id: string,
    userId: string,
    updates: Partial<CreateMuralPostData>
  ): Promise<ServiceResult<MuralPost>> {
    try {
      // Verificar se o post pertence ao usuário
      const postResult = await this.findById(id)
      if (!postResult.success) {
        return postResult
      }

      if (postResult.data!.user_id !== userId) {
        return {
          success: false,
          error: {
            message: 'Você não tem permissão para editar este post',
            code: 'FORBIDDEN',
          },
        }
      }

      const updateData: Partial<MuralPost> = {
        ...updates,
        updated_at: new Date().toISOString(),
      }

      return this.update(id, updateData, { partial: true })
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Deleta um post
   */
  public async deletePost(
    id: string,
    userId: string
  ): Promise<ServiceResult<void>> {
    try {
      // Verificar se o post pertence ao usuário
      const postResult = await this.findById(id)
      if (!postResult.success) {
        return { success: false, error: postResult.error }
      }

      if (postResult.data!.user_id !== userId) {
        return {
          success: false,
          error: {
            message: 'Você não tem permissão para deletar este post',
            code: 'FORBIDDEN',
          },
        }
      }

      return this.delete(id)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Upload de imagens do post
   * Retorna as URLs das imagens após upload
   */
  public async uploadPostImages(
    postId: string,
    files: File[]
  ): Promise<ServiceResult<string[]>> {
    try {
      const client = await this.ensureClient()

      if (!files || files.length === 0) {
        return {
          success: false,
          error: {
            message: 'Nenhum arquivo fornecido',
            code: 'NO_FILES',
          },
        }
      }

      if (files.length > 3) {
        return {
          success: false,
          error: {
            message: 'Máximo de 3 imagens por post',
            code: 'TOO_MANY_FILES',
          },
        }
      }

      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validar tipo do arquivo
        if (!file.type.startsWith('image/')) {
          return {
            success: false,
            error: {
              message: `Arquivo ${file.name} não é uma imagem`,
              code: 'INVALID_FILE_TYPE',
            },
          }
        }

        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          return {
            success: false,
            error: {
              message: `Arquivo ${file.name} excede 5MB`,
              code: 'FILE_TOO_LARGE',
            },
          }
        }

        // Gerar nome único para o arquivo
        const fileExt = file.name.split('.').pop()
        const fileName = `${postId}-${i}-${Date.now()}.${fileExt}`
        const filePath = `mural/${fileName}`

        // Upload para o storage
        const { error: uploadError } = await client.storage
          .from('posts')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          return this.handleError(uploadError)
        }

        // Obter URL pública
        const { data: { publicUrl } } = client.storage
          .from('posts')
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
      }

      return {
        success: true,
        data: uploadedUrls,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Busca posts por tipo
   */
  public async getByType(
    type: MuralPost['type'],
    limit: number = 10
  ): Promise<ServiceResult<MuralPost[]>> {
    try {
      const client = await this.ensureClient()

      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        return this.handleError(error)
      }

      return {
        success: true,
        data: (data || []) as MuralPost[],
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Busca posts de um usuário específico
   */
  public async getUserPosts(
    userId: string,
    limit?: number
  ): Promise<ServiceResult<MuralPost[]>> {
    try {
      const client = await this.ensureClient()

      let query = client
        .from(this.tableName as any)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        return this.handleError(error)
      }

      return {
        success: true,
        data: (data || []) as MuralPost[],
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Busca posts recentes
   */
  public async getRecentPosts(
    limit: number = 20
  ): Promise<ServiceResult<MuralPost[]>> {
    try {
      const client = await this.ensureClient()

      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        return this.handleError(error)
      }

      return {
        success: true,
        data: (data || []) as MuralPost[],
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Busca posts por query (título e conteúdo)
   */
  public async searchPosts(
    query: string,
    limit: number = 20
  ): Promise<ServiceResult<MuralPost[]>> {
    try {
      if (!query || query.trim().length < 2) {
        return {
          success: false,
          error: {
            message: 'Query deve ter no mínimo 2 caracteres',
            code: 'INVALID_QUERY',
          },
        }
      }

      const client = await this.ensureClient()

      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        return this.handleError(error)
      }

      return {
        success: true,
        data: (data || []) as MuralPost[],
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Busca anúncios (type: announcement)
   */
  public async getAnnouncements(
    limit: number = 10
  ): Promise<ServiceResult<MuralPost[]>> {
    return this.getByType('announcement', limit)
  }

  /**
   * Busca eventos (type: event)
   */
  public async getEvents(
    limit: number = 10
  ): Promise<ServiceResult<MuralPost[]>> {
    return this.getByType('event', limit)
  }
}

// Singleton instance
let muralServiceInstance: MuralService | null = null

/**
 * Obtém instância singleton do MuralService
 */
export function getMuralService(): MuralService {
  if (!muralServiceInstance) {
    muralServiceInstance = new MuralService()
  }
  return muralServiceInstance
}
