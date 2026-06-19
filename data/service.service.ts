import { BaseService } from './base.service'
import { territoryOrFilter } from '@/lib/territories'
import { getTekoinService } from './tekoin.service'
import type { ServiceResult, PaginatedResult } from './types'
import type { Database } from '@/types/database.types'

type ServiceRow = Database['public']['Tables']['services']['Row']
type ServiceInsert = Database['public']['Tables']['services']['Insert']

export interface CreateServiceData {
  title: string
  description: string
  type: 'offer' | 'request'
  category: string
  proximity?: number
  community?: string | null
  reach?: string
  reach_communities?: string[]
}

export interface ServiceFilters {
  type?: 'offer' | 'request'
  category?: string
  status?: 'active' | 'matched' | 'completed' | 'cancelled'
  userId?: string
  excludeUserId?: string
  searchQuery?: string
  limit?: number
  offset?: number
  /** Comunidade do espectador (para filtrar por território). */
  viewerCommunity?: string | null
  /** Ignora o filtro de território (mostra todos). */
  allTerritories?: boolean
}

/** Autor resumido anexado a um serviço. */
export interface ServiceAuthor {
  id: string
  full_name: string | null
  location: string | null
  avatar_url: string | null
}

/** Serviço com o autor embutido (via join). */
export interface ServiceWithUser extends ServiceRow {
  user: ServiceAuthor | null
}

/**
 * Service para a tabela `services` (Trocas / Tinder de Serviços).
 *
 * Responsável pelo CRUD de ofertas e pedidos de serviço e por fornecer os
 * candidatos para o algoritmo de matching (lib/matching).
 */
export class ServiceService extends BaseService<ServiceRow> {
  constructor() {
    super('services')
  }

  protected validate(data: Partial<ServiceRow>): ServiceResult<ServiceRow> {
    if (data.title !== undefined) {
      if (!data.title || data.title.trim().length < 5) {
        return {
          success: false,
          error: { message: 'Título precisa de ao menos 5 caracteres', code: 'INVALID_TITLE' },
        }
      }
      if (data.title.length > 100) {
        return {
          success: false,
          error: { message: 'Título pode ter no máximo 100 caracteres', code: 'TITLE_TOO_LONG' },
        }
      }
    }

    if (data.description !== undefined) {
      if (!data.description || data.description.trim().length < 20) {
        return {
          success: false,
          error: {
            message: 'Descrição precisa de ao menos 20 caracteres',
            code: 'INVALID_DESCRIPTION',
          },
        }
      }
      if (data.description.length > 500) {
        return {
          success: false,
          error: {
            message: 'Descrição pode ter no máximo 500 caracteres',
            code: 'DESCRIPTION_TOO_LONG',
          },
        }
      }
    }

    if (data.type !== undefined && data.type !== 'offer' && data.type !== 'request') {
      return {
        success: false,
        error: { message: 'Tipo inválido', code: 'INVALID_TYPE' },
      }
    }

    if (data.category !== undefined && !data.category) {
      return {
        success: false,
        error: { message: 'Categoria é obrigatória', code: 'INVALID_CATEGORY' },
      }
    }

    return { success: true, data: data as ServiceRow }
  }

  /**
   * Cria um novo serviço (oferta ou pedido) para o usuário.
   */
  public async createService(
    userId: string,
    data: CreateServiceData
  ): Promise<ServiceResult<ServiceRow>> {
    const insert: ServiceInsert = {
      user_id: userId,
      title: data.title.trim(),
      description: data.description.trim(),
      type: data.type,
      category: data.category,
      proximity: data.proximity ?? 5,
      status: 'active',
      community: data.community ?? null,
      reach: data.reach ?? 'own',
      reach_communities: data.reach_communities ?? [],
    }
    return this.create(insert)
  }

  /**
   * Lista serviços com filtros. Por padrão retorna apenas ativos.
   */
  public async getServices(
    filters?: ServiceFilters
  ): Promise<ServiceResult<PaginatedResult<ServiceRow>>> {
    try {
      const client = await this.ensureClient()

      let query = client.from(this.tableName as any).select('*', { count: 'exact' })

      query = query.eq('status', filters?.status ?? 'active')
      if (filters?.type) query = query.eq('type', filters.type)
      if (filters?.category) query = query.eq('category', filters.category)
      if (filters?.userId) query = query.eq('user_id', filters.userId)
      if (filters?.excludeUserId) query = query.neq('user_id', filters.excludeUserId)
      if (filters?.searchQuery) {
        query = query.or(
          `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
        )
      }

      query = query.order('created_at', { ascending: false })

      if (filters?.limit) query = query.limit(filters.limit)
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)
      }

      const { data, error, count } = await query
      if (error) return this.handleError(error)

      return {
        success: true,
        data: {
          data: (data || []) as ServiceRow[],
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

  public async getServiceById(id: string): Promise<ServiceResult<ServiceRow>> {
    return this.findById(id)
  }

  /**
   * Lista serviços já com o autor embutido (join com users), numa só query.
   */
  public async getServicesWithUser(
    filters?: ServiceFilters
  ): Promise<ServiceResult<ServiceWithUser[]>> {
    try {
      const client = await this.ensureClient()

      let query = client
        .from(this.tableName as any)
        .select('*, user:users(id, full_name, location, avatar_url)')

      query = query.eq('status', filters?.status ?? 'active')
      if (filters?.type) query = query.eq('type', filters.type)
      if (filters?.category) query = query.eq('category', filters.category)
      if (filters?.userId) query = query.eq('user_id', filters.userId)
      if (filters?.excludeUserId) query = query.neq('user_id', filters.excludeUserId)
      if (filters?.searchQuery) {
        query = query.or(
          `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
        )
      }
      if (filters?.viewerCommunity && !filters?.allTerritories) {
        query = query.or(territoryOrFilter(filters.viewerCommunity))
      }

      query = query.order('created_at', { ascending: false })
      if (filters?.limit) query = query.limit(filters.limit)

      const { data, error } = await query
      if (error) return this.handleError(error)

      const services = (data || []) as unknown as ServiceWithUser[]
      return { success: true, data: await getTekoinService().sortByActiveBoost(services, 'service_id') }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Lista os serviços do próprio usuário (qualquer status).
   */
  public async getUserServices(
    userId: string,
    status?: ServiceFilters['status']
  ): Promise<ServiceResult<ServiceRow[]>> {
    try {
      const client = await this.ensureClient()
      let query = client
        .from(this.tableName as any)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (status) query = query.eq('status', status)

      const { data, error } = await query
      if (error) return this.handleError(error)

      return { success: true, data: (data || []) as ServiceRow[] }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Atualiza um serviço (apenas o dono).
   */
  public async updateService(
    id: string,
    userId: string,
    updates: Partial<CreateServiceData>
  ): Promise<ServiceResult<ServiceRow>> {
    const owned = await this.findById(id)
    if (!owned.success) return owned
    if (owned.data!.user_id !== userId) {
      return {
        success: false,
        error: { message: 'Você não pode editar este serviço', code: 'FORBIDDEN' },
      }
    }
    return this.update(id, { ...updates, updated_at: new Date().toISOString() }, { partial: true })
  }

  /**
   * Atualiza apenas o status (ex.: marcar como concluído).
   */
  public async updateStatus(
    id: string,
    userId: string,
    status: NonNullable<ServiceFilters['status']>
  ): Promise<ServiceResult<ServiceRow>> {
    const owned = await this.findById(id)
    if (!owned.success) return owned
    if (owned.data!.user_id !== userId) {
      return {
        success: false,
        error: { message: 'Você não pode alterar este serviço', code: 'FORBIDDEN' },
      }
    }
    return this.update(
      id,
      { status, updated_at: new Date().toISOString() },
      { partial: true, skipValidation: true }
    )
  }

  /**
   * Remove um serviço (apenas o dono).
   */
  public async deleteService(id: string, userId: string): Promise<ServiceResult<void>> {
    const owned = await this.findById(id)
    if (!owned.success) return { success: false, error: owned.error }
    if (owned.data!.user_id !== userId) {
      return {
        success: false,
        error: { message: 'Você não pode remover este serviço', code: 'FORBIDDEN' },
      }
    }
    return this.delete(id)
  }
}

// Singleton
let serviceServiceInstance: ServiceService | null = null

export function getServiceService(): ServiceService {
  if (!serviceServiceInstance) {
    serviceServiceInstance = new ServiceService()
  }
  return serviceServiceInstance
}
