import { BaseService } from './base.service'
import { territoryOrFilter, type Reach } from '@/lib/territories'
import type { ServiceResult } from './types'
import type { MutiraoRequest, MutiraoConfirmation } from '@/types'

export interface CreateMutiraoData {
  title: string
  description: string
  location?: string | null
  scheduledAt?: string | null
  minConfirmations: number
  communityId?: string | null
  /** Território informal do organizador (denormalizado), definido na action. */
  community?: string | null
  reach?: Reach
  reachCommunities?: string[]
}

export interface ListOpenMutiroesFilters {
  viewerCommunity?: string | null
  allTerritories?: boolean
  limit?: number
}

/**
 * Pedido multi-participante (Fase 5) — paralelo ao pedido 1:1 (troca/feira/
 * busca). Qualquer morador pode organizar; não é exclusivo a causas
 * comunitárias.
 */
export class MutiraoService extends BaseService<MutiraoRequest> {
  constructor() {
    super('mutirao_requests')
  }

  protected validate(data: Partial<MutiraoRequest>): ServiceResult<MutiraoRequest> {
    if (data.min_confirmations !== undefined && data.min_confirmations < 1) {
      return {
        success: false,
        error: { message: 'Mínimo de confirmações deve ser ao menos 1', code: 'INVALID_MIN' },
      }
    }
    return { success: true, data: data as MutiraoRequest }
  }

  public async createMutirao(
    organizerId: string,
    data: CreateMutiraoData
  ): Promise<ServiceResult<MutiraoRequest>> {
    return this.create({
      organizer_id: organizerId,
      community_id: data.communityId ?? null,
      title: data.title,
      description: data.description,
      location: data.location ?? null,
      scheduled_at: data.scheduledAt ?? null,
      min_confirmations: data.minConfirmations,
      status: 'open',
      community: data.community ?? null,
      reach: data.reach ?? 'own',
      reach_communities: data.reachCommunities ?? [],
    } as Partial<MutiraoRequest>)
  }

  public async getMutiraoById(id: string): Promise<ServiceResult<MutiraoRequest>> {
    return this.findById(id)
  }

  public async listOpenMutiroes(
    filters?: ListOpenMutiroesFilters
  ): Promise<ServiceResult<MutiraoRequest[]>> {
    try {
      const client = await this.ensureClient()
      let query = client
        .from(this.tableName as any)
        .select('*')
        .in('status', ['open', 'confirmed'])

      if (filters?.viewerCommunity && !filters?.allTerritories) {
        query = query.or(territoryOrFilter(filters.viewerCommunity))
      }

      query = query.order('created_at', { ascending: false }).limit(filters?.limit ?? 30)

      const { data, error } = await query
      if (error) return this.handleError(error)
      return { success: true, data: (data ?? []) as MutiraoRequest[] }
    } catch (error) {
      return this.handleError(error)
    }
  }

  public async listOrganizedBy(userId: string): Promise<ServiceResult<MutiraoRequest[]>> {
    try {
      const client = await this.ensureClient()
      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .eq('organizer_id', userId)
        .order('created_at', { ascending: false })

      if (error) return this.handleError(error)
      return { success: true, data: (data ?? []) as MutiraoRequest[] }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /** Mutirões em que o usuário confirmou presença (organizados por outros). */
  public async listConfirmedBy(userId: string): Promise<ServiceResult<MutiraoRequest[]>> {
    try {
      const client = await this.ensureClient()
      const { data: confirmations, error: confError } = await client
        .from('mutirao_confirmations')
        .select('mutirao_id')
        .eq('user_id', userId)

      if (confError) return this.handleError(confError)
      const ids = (confirmations ?? []).map((c: { mutirao_id: string }) => c.mutirao_id)
      if (ids.length === 0) return { success: true, data: [] }

      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .in('id', ids)
        .order('created_at', { ascending: false })

      if (error) return this.handleError(error)
      return { success: true, data: (data ?? []) as MutiraoRequest[] }
    } catch (error) {
      return this.handleError(error)
    }
  }

  public async confirmAttendance(
    mutiraoId: string,
    userId: string
  ): Promise<ServiceResult<MutiraoConfirmation>> {
    try {
      const mutiraoRes = await this.findById(mutiraoId)
      if (!mutiraoRes.success || !mutiraoRes.data) {
        return { success: false, error: { message: 'Mutirão não encontrado', code: 'NOT_FOUND' } }
      }
      if (mutiraoRes.data.organizer_id === userId) {
        return {
          success: false,
          error: { message: 'Você é o organizador deste mutirão', code: 'IS_ORGANIZER' },
        }
      }
      if (mutiraoRes.data.status !== 'open' && mutiraoRes.data.status !== 'confirmed') {
        return {
          success: false,
          error: { message: 'Este mutirão não está mais aceitando confirmações', code: 'CLOSED' },
        }
      }

      const client = await this.ensureClient()
      const { data, error } = await client
        .from('mutirao_confirmations')
        .insert({ mutirao_id: mutiraoId, user_id: userId })
        .select()
        .single()

      if (error) return this.handleError(error)

      const countRes = await this.getConfirmationCount(mutiraoId)
      if (
        countRes.success &&
        (countRes.data ?? 0) >= mutiraoRes.data.min_confirmations &&
        mutiraoRes.data.status === 'open'
      ) {
        await this.update(mutiraoId, { status: 'confirmed' }, { partial: true, skipValidation: true })
      }

      return { success: true, data: data as MutiraoConfirmation }
    } catch (error) {
      return this.handleError(error)
    }
  }

  public async getConfirmationCount(mutiraoId: string): Promise<ServiceResult<number>> {
    try {
      const client = await this.ensureClient()
      const { count, error } = await client
        .from('mutirao_confirmations')
        .select('*', { count: 'exact', head: true })
        .eq('mutirao_id', mutiraoId)

      if (error) return this.handleError(error)
      return { success: true, data: count ?? 0 }
    } catch (error) {
      return this.handleError(error)
    }
  }

  public async getConfirmations(mutiraoId: string): Promise<ServiceResult<MutiraoConfirmation[]>> {
    try {
      const client = await this.ensureClient()
      const { data, error } = await client
        .from('mutirao_confirmations')
        .select('*')
        .eq('mutirao_id', mutiraoId)
        .order('confirmed_at', { ascending: true })

      if (error) return this.handleError(error)
      return { success: true, data: (data ?? []) as MutiraoConfirmation[] }
    } catch (error) {
      return this.handleError(error)
    }
  }

  public async cancelMutirao(mutiraoId: string, organizerId: string): Promise<ServiceResult<MutiraoRequest>> {
    const mutiraoRes = await this.findById(mutiraoId)
    if (!mutiraoRes.success || !mutiraoRes.data) return mutiraoRes
    if (mutiraoRes.data.organizer_id !== organizerId) {
      return { success: false, error: { message: 'Só o organizador pode cancelar', code: 'FORBIDDEN' } }
    }
    return this.update(mutiraoId, { status: 'cancelled' }, { partial: true, skipValidation: true })
  }

  /**
   * Fecha a lista de presença e marca o mutirão como concluído. Quem
   * organizou (admin de comunidade ou usuário comum) é sempre quem fecha —
   * sem confirmação cruzada entre participantes.
   */
  public async markAttendance(
    mutiraoId: string,
    organizerId: string,
    attendance: { userId: string; attended: boolean }[]
  ): Promise<ServiceResult<void>> {
    const mutiraoRes = await this.findById(mutiraoId)
    if (!mutiraoRes.success || !mutiraoRes.data) {
      return { success: false, error: mutiraoRes.error || { message: 'Mutirão não encontrado' } }
    }
    if (mutiraoRes.data.organizer_id !== organizerId) {
      return { success: false, error: { message: 'Só o organizador pode fechar a lista', code: 'FORBIDDEN' } }
    }

    try {
      const client = await this.ensureClient()
      for (const a of attendance) {
        await client
          .from('mutirao_confirmations')
          .update({ attended: a.attended })
          .eq('mutirao_id', mutiraoId)
          .eq('user_id', a.userId)
      }
      const { error } = await client
        .from(this.tableName as any)
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', mutiraoId)

      if (error) return this.handleError(error) as ServiceResult<void>
      return { success: true }
    } catch (error) {
      return this.handleError(error) as ServiceResult<void>
    }
  }
}

let mutiraoServiceInstance: MutiraoService | null = null

export function getMutiraoService(): MutiraoService {
  if (!mutiraoServiceInstance) {
    mutiraoServiceInstance = new MutiraoService()
  }
  return mutiraoServiceInstance
}
