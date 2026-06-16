import { BaseService } from './base.service'
import type { ServiceResult } from './types'
import type { Database } from '@/types/database.types'

type Rating = Database['public']['Tables']['ratings']['Row']
type RatingInsert = Database['public']['Tables']['ratings']['Insert']
type RatingUpdate = Database['public']['Tables']['ratings']['Update']

/**
 * Dados para criação de avaliação
 */
export interface CreateRatingData {
  to_user_id: string
  rating: number
  comment?: string | null
  service_id?: string | null
}

/**
 * Estatísticas de avaliação de um usuário
 */
export interface UserRatingStats {
  userId: string
  averageRating: number
  totalRatings: number
  ratings: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

/**
 * Service para gerenciar avaliações de usuários
 * 
 * Responsável por:
 * - CRUD de avaliações
 * - Calcular média de avaliações
 * - Buscar avaliações de um usuário
 * - Validar permissões
 */
export class RatingService extends BaseService<Rating> {
  constructor() {
    super('ratings')
  }

  /**
   * Valida dados da avaliação
   */
  protected validate(data: Partial<Rating>): ServiceResult<Rating> {
    // Validar rating (deve ser entre 1 e 5)
    if (data.rating !== undefined) {
      if (typeof data.rating !== 'number' || data.rating < 1 || data.rating > 5) {
        return {
          success: false,
          error: {
            message: 'Avaliação deve ser entre 1 e 5',
            code: 'INVALID_RATING',
          },
        }
      }

      // Verificar se é um número inteiro
      if (!Number.isInteger(data.rating)) {
        return {
          success: false,
          error: {
            message: 'Avaliação deve ser um número inteiro',
            code: 'INVALID_RATING',
          },
        }
      }
    }

    // Validar usuários
    if (data.from_user_id !== undefined && !data.from_user_id) {
      return {
        success: false,
        error: {
          message: 'Usuário que avalia é obrigatório',
          code: 'INVALID_USER',
        },
      }
    }

    if (data.to_user_id !== undefined && !data.to_user_id) {
      return {
        success: false,
        error: {
          message: 'Usuário avaliado é obrigatório',
          code: 'INVALID_USER',
        },
      }
    }

    // Não pode avaliar a si mesmo
    if (
      data.from_user_id &&
      data.to_user_id &&
      data.from_user_id === data.to_user_id
    ) {
      return {
        success: false,
        error: {
          message: 'Não é possível avaliar a si mesmo',
          code: 'SELF_RATING',
        },
      }
    }

    // Validar comentário
    if (data.comment !== undefined && data.comment !== null) {
      if (data.comment.length > 500) {
        return {
          success: false,
          error: {
            message: 'Comentário não pode exceder 500 caracteres',
            code: 'COMMENT_TOO_LONG',
          },
        }
      }
    }

    return { success: true, data: data as Rating }
  }

  /**
   * Cria uma nova avaliação
   */
  public async createRating(
    fromUserId: string,
    ratingData: CreateRatingData
  ): Promise<ServiceResult<Rating>> {
    try {
      // Verificar se já existe uma avaliação para este serviço
      if (ratingData.service_id) {
        const existingResult = await this.hasRatedService(
          fromUserId,
          ratingData.service_id
        )

        if (!existingResult.success) {
          return { success: false, error: existingResult.error }
        }

        if (existingResult.data) {
          return {
            success: false,
            error: {
              message: 'Você já avaliou este serviço',
              code: 'ALREADY_RATED',
            },
          }
        }
      }

      const insertData: RatingInsert = {
        from_user_id: fromUserId,
        to_user_id: ratingData.to_user_id,
        rating: ratingData.rating,
        comment: ratingData.comment || null,
        service_id: ratingData.service_id || null,
      }

      const result = await this.create(insertData)

      // Se criou com sucesso, atualizar estatísticas do usuário
      if (result.success) {
        await this.updateUserRatingStats(ratingData.to_user_id)
      }

      return result
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Verifica se usuário já avaliou um serviço
   */
  public async hasRatedService(
    userId: string,
    serviceId: string
  ): Promise<ServiceResult<boolean>> {
    try {
      const client = await this.ensureClient()

      const { data, error } = await client
        .from(this.tableName as any)
        .select('id')
        .eq('from_user_id', userId)
        .eq('service_id', serviceId)
        .limit(1)

      if (error) {
        return this.handleError(error)
      }

      return {
        success: true,
        data: (data?.length || 0) > 0,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Busca avaliações recebidas por um usuário
   */
  public async getUserRatings(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<ServiceResult<Rating[]>> {
    try {
      const client = await this.ensureClient()

      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .eq('to_user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return this.handleError(error)
      }

      return {
        success: true,
        data: (data || []) as Rating[],
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Busca avaliações feitas por um usuário
   */
  public async getRatingsByUser(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<ServiceResult<Rating[]>> {
    try {
      const client = await this.ensureClient()

      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .eq('from_user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return this.handleError(error)
      }

      return {
        success: true,
        data: (data || []) as Rating[],
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Busca avaliação por ID
   */
  public async getRatingById(id: string): Promise<ServiceResult<Rating>> {
    return this.findById(id)
  }

  /**
   * Atualiza uma avaliação
   */
  public async updateRating(
    id: string,
    userId: string,
    updates: Partial<CreateRatingData>
  ): Promise<ServiceResult<Rating>> {
    try {
      // Verificar se a avaliação pertence ao usuário
      const ratingResult = await this.findById(id)
      if (!ratingResult.success) {
        return ratingResult
      }

      if (ratingResult.data!.from_user_id !== userId) {
        return {
          success: false,
          error: {
            message: 'Você não tem permissão para editar esta avaliação',
            code: 'FORBIDDEN',
          },
        }
      }

      const updateData: Partial<Rating> = {}

      if (updates.rating !== undefined) {
        updateData.rating = updates.rating
      }

      if (updates.comment !== undefined) {
        updateData.comment = updates.comment
      }

      const result = await this.update(id, updateData, { partial: true })

      // Se atualizou com sucesso, atualizar estatísticas do usuário
      if (result.success) {
        await this.updateUserRatingStats(ratingResult.data!.to_user_id)
      }

      return result
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Deleta uma avaliação
   */
  public async deleteRating(
    id: string,
    userId: string
  ): Promise<ServiceResult<void>> {
    try {
      // Verificar se a avaliação pertence ao usuário
      const ratingResult = await this.findById(id)
      if (!ratingResult.success) {
        return { success: false, error: ratingResult.error }
      }

      if (ratingResult.data!.from_user_id !== userId) {
        return {
          success: false,
          error: {
            message: 'Você não tem permissão para deletar esta avaliação',
            code: 'FORBIDDEN',
          },
        }
      }

      const toUserId = ratingResult.data!.to_user_id

      const result = await this.delete(id)

      // Se deletou com sucesso, atualizar estatísticas do usuário
      if (result.success) {
        await this.updateUserRatingStats(toUserId)
      }

      return result
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Calcula estatísticas de avaliação de um usuário
   */
  public async getUserRatingStats(
    userId: string
  ): Promise<ServiceResult<UserRatingStats>> {
    try {
      const client = await this.ensureClient()

      const { data, error } = await client
        .from(this.tableName as any)
        .select('rating')
        .eq('to_user_id', userId)

      if (error) {
        return this.handleError(error)
      }

      const ratings = (data || []) as { rating: number }[]

      if (ratings.length === 0) {
        return {
          success: true,
          data: {
            userId,
            averageRating: 0,
            totalRatings: 0,
            ratings: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          },
        }
      }

      // Calcular estatísticas
      const totalRatings = ratings.length
      const sum = ratings.reduce((acc, r) => acc + r.rating, 0)
      const averageRating = Math.round((sum / totalRatings) * 10) / 10

      const ratingCounts = {
        5: ratings.filter((r) => r.rating === 5).length,
        4: ratings.filter((r) => r.rating === 4).length,
        3: ratings.filter((r) => r.rating === 3).length,
        2: ratings.filter((r) => r.rating === 2).length,
        1: ratings.filter((r) => r.rating === 1).length,
      }

      return {
        success: true,
        data: {
          userId,
          averageRating,
          totalRatings,
          ratings: ratingCounts,
        },
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Atualiza as estatísticas de avaliação na tabela users
   */
  private async updateUserRatingStats(userId: string): Promise<void> {
    try {
      const statsResult = await this.getUserRatingStats(userId)

      if (!statsResult.success || !statsResult.data) {
        return
      }

      const { averageRating, totalRatings } = statsResult.data

      const client = await this.ensureClient()

      await client
        .from('users')
        .update({
          rating: averageRating,
          total_ratings: totalRatings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
    } catch (error) {
      // Silenciar erro - não é crítico se falhar a atualização
      console.error('Erro ao atualizar estatísticas do usuário:', error)
    }
  }

  /**
   * Busca avaliações de um serviço específico
   */
  public async getServiceRatings(
    serviceId: string,
    limit: number = 20
  ): Promise<ServiceResult<Rating[]>> {
    try {
      const client = await this.ensureClient()

      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        return this.handleError(error)
      }

      return {
        success: true,
        data: (data || []) as Rating[],
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Busca avaliações recentes (todas)
   */
  public async getRecentRatings(
    limit: number = 10
  ): Promise<ServiceResult<Rating[]>> {
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
        data: (data || []) as Rating[],
      }
    } catch (error) {
      return this.handleError(error)
    }
  }
}

// Singleton instance
let ratingServiceInstance: RatingService | null = null

/**
 * Obtém instância singleton do RatingService
 */
export function getRatingService(): RatingService {
  if (!ratingServiceInstance) {
    ratingServiceInstance = new RatingService()
  }
  return ratingServiceInstance
}
