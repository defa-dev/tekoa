import { BaseService } from './base.service'
import type { ServiceResult } from './types'
import type { Database } from '@/types/database.types'

type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

/**
 * Interface para dados de perfil do usuário
 */
export interface UserProfile {
  fullName?: string | null
  avatarUrl?: string | null
  phone?: string | null
  location?: string | null
  bio?: string | null
}

/**
 * Service para gerenciar dados de usuários
 * 
 * Responsável por:
 * - Buscar usuário autenticado
 * - Buscar usuário por ID
 * - Atualizar perfil do usuário
 * - Upload de avatar
 * - Buscar usuários por critérios
 */
export class UserService extends BaseService<User> {
  constructor() {
    super('users')
  }

  /**
   * Valida dados do usuário
   */
  protected validate(data: Partial<User>): ServiceResult<User> {
    // Email é obrigatório
    if (data.email !== undefined && (!data.email || !data.email.includes('@'))) {
      return {
        success: false,
        error: {
          message: 'Email inválido',
          code: 'INVALID_EMAIL',
        },
      }
    }

    // Nome deve ter no mínimo 2 caracteres se fornecido
    if (data.full_name !== undefined && data.full_name !== null) {
      if (data.full_name.length < 2) {
        return {
          success: false,
          error: {
            message: 'Nome deve ter no mínimo 2 caracteres',
            code: 'INVALID_NAME',
          },
        }
      }
    }

    // Phone deve ser válido se fornecido
    if (data.phone !== undefined && data.phone !== null) {
      // Validação básica: apenas números, +, -, (, ), espaços
      if (!/^[\d\s+()-]+$/.test(data.phone)) {
        return {
          success: false,
          error: {
            message: 'Telefone inválido',
            code: 'INVALID_PHONE',
          },
        }
      }
    }

    // Bio não pode exceder 500 caracteres
    if (data.bio !== undefined && data.bio !== null && data.bio.length > 500) {
      return {
        success: false,
        error: {
          message: 'Bio não pode exceder 500 caracteres',
          code: 'BIO_TOO_LONG',
        },
      }
    }

    return { success: true, data: data as User }
  }

  /**
   * Obtém o usuário autenticado atual
   */
  public async getCurrentUser(): Promise<ServiceResult<User>> {
    try {
      const client = await this.ensureClient()

      const { data: { user: authUser }, error: authError } = await client.auth.getUser()

      if (authError || !authUser) {
        return {
          success: false,
          error: {
            message: 'Usuário não autenticado',
            code: 'NOT_AUTHENTICATED',
          },
        }
      }

      // Buscar dados completos do usuário na tabela users
      const result = await this.findById(authUser.id)

      if (!result.success) {
        // Se o usuário não existe na tabela users, podemos criar
        const createResult = await this.createUserFromAuth(authUser.id, authUser.email!)
        if (!createResult.success) {
          return result
        }
        return createResult
      }

      return result
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Cria um usuário na tabela users a partir dos dados de autenticação
   */
  private async createUserFromAuth(
    userId: string,
    email: string
  ): Promise<ServiceResult<User>> {
    const userData: UserInsert = {
      id: userId,
      email,
      total_ratings: 0,
    }

    return this.create(userData, { skipValidation: true })
  }

  /**
   * Busca usuário por ID
   */
  public async getUserById(id: string): Promise<ServiceResult<User>> {
    return this.findById(id)
  }

  /**
   * Busca usuário por e-mail (ex.: admin atribuindo papel por e-mail).
   */
  public async getUserByEmail(email: string): Promise<ServiceResult<User | null>> {
    try {
      const client = await this.ensureClient()
      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle()

      if (error) return this.handleError(error)
      return { success: true, data: (data as User) ?? null }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Atualiza o perfil do usuário autenticado
   */
  public async updateProfile(
    userId: string,
    profile: UserProfile
  ): Promise<ServiceResult<User>> {
    try {
      // Converter snake_case para o formato do banco
      const updateData: Partial<User> = {}

      if (profile.fullName !== undefined) {
        updateData.full_name = profile.fullName
      }
      if (profile.avatarUrl !== undefined) {
        updateData.avatar_url = profile.avatarUrl
      }
      if (profile.phone !== undefined) {
        updateData.phone = profile.phone
      }
      if (profile.location !== undefined) {
        updateData.location = profile.location
      }
      if (profile.bio !== undefined) {
        updateData.bio = profile.bio
      }

      updateData.updated_at = new Date().toISOString()

      return this.update(userId, updateData, { partial: true })
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Atualiza apenas o avatar do usuário
   */
  public async updateAvatar(
    userId: string,
    avatarUrl: string
  ): Promise<ServiceResult<User>> {
    try {
      const updateData: Partial<User> = {
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }

      return this.update(userId, updateData, { partial: true, skipValidation: true })
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Upload de avatar para o storage
   * Nota: Esta função faz upload do arquivo, mas não atualiza o banco
   * Use updateAvatar() depois para salvar a URL
   */
  public async uploadAvatar(
    userId: string,
    file: File
  ): Promise<ServiceResult<{ url: string; path: string }>> {
    try {
      const client = await this.ensureClient()

      // Validar tipo do arquivo
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          error: {
            message: 'Arquivo deve ser uma imagem',
            code: 'INVALID_FILE_TYPE',
          },
        }
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return {
          success: false,
          error: {
            message: 'Arquivo não pode exceder 5MB',
            code: 'FILE_TOO_LARGE',
          },
        }
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload para o storage
      const { error: uploadError } = await client.storage
        .from('users')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        return this.handleError(uploadError)
      }

      // Obter URL pública
      const { data: { publicUrl } } = client.storage
        .from('users')
        .getPublicUrl(filePath)

      return {
        success: true,
        data: {
          url: publicUrl,
          path: filePath,
        },
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Lista as comunidades (bairros) presentes na base, com a contagem de
   * vizinhos em cada uma. Ordenado da maior para a menor.
   */
  public async getCommunities(): Promise<
    ServiceResult<{ name: string; count: number }[]>
  > {
    try {
      const client = await this.ensureClient()
      const { data, error } = await client
        .from(this.tableName as any)
        .select('location')
        .not('location', 'is', null)

      if (error) return this.handleError(error)

      const counts = new Map<string, number>()
      for (const row of (data || []) as { location: string | null }[]) {
        const name = row.location?.trim()
        if (name) counts.set(name, (counts.get(name) || 0) + 1)
      }

      const communities = Array.from(counts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)

      return { success: true, data: communities }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Busca vários usuários por id, numa só query (para montar mapas de autor).
   */
  public async getUsersByIds(ids: string[]): Promise<ServiceResult<User[]>> {
    try {
      if (ids.length === 0) return { success: true, data: [] }

      const client = await this.ensureClient()
      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .in('id', ids)

      if (error) return this.handleError(error)
      return { success: true, data: (data || []) as User[] }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Busca usuários por nome (pesquisa)
   */
  public async searchByName(
    query: string,
    limit: number = 10
  ): Promise<ServiceResult<User[]>> {
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
        .ilike('full_name', `%${query}%`)
        .limit(limit)

      if (error) {
        return this.handleError(error)
      }

      return {
        success: true,
        data: (data || []) as User[],
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Busca usuários por localização
   */
  public async findByLocation(
    location: string,
    limit: number = 10
  ): Promise<ServiceResult<User[]>> {
    try {
      const client = await this.ensureClient()

      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .ilike('location', `%${location}%`)
        .limit(limit)

      if (error) {
        return this.handleError(error)
      }

      return {
        success: true,
        data: (data || []) as User[],
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Obtém usuários com melhor avaliação
   */
  public async getTopRated(limit: number = 10): Promise<ServiceResult<User[]>> {
    try {
      const client = await this.ensureClient()

      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .not('rating', 'is', null)
        .gte('total_ratings', 1)
        .order('rating', { ascending: false })
        .limit(limit)

      if (error) {
        return this.handleError(error)
      }

      return {
        success: true,
        data: (data || []) as User[],
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Atualiza a avaliação média do usuário
   * Nota: Normalmente seria chamado após uma nova avaliação
   */
  public async updateRating(
    userId: string,
    newRating: number,
    totalRatings: number
  ): Promise<ServiceResult<User>> {
    try {
      if (newRating < 0 || newRating > 5) {
        return {
          success: false,
          error: {
            message: 'Rating deve estar entre 0 e 5',
            code: 'INVALID_RATING',
          },
        }
      }

      const updateData: Partial<User> = {
        rating: newRating,
        total_ratings: totalRatings,
        updated_at: new Date().toISOString(),
      }

      return this.update(userId, updateData, { partial: true, skipValidation: true })
    } catch (error) {
      return this.handleError(error)
    }
  }
}

// Singleton instance
let userServiceInstance: UserService | null = null

/**
 * Obtém instância singleton do UserService
 */
export function getUserService(): UserService {
  if (!userServiceInstance) {
    userServiceInstance = new UserService()
  }
  return userServiceInstance
}
