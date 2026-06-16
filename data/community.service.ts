import { BaseService } from './base.service'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ServiceResult } from './types'
import type { Database } from '@/types/database.types'

type Community = Database['public']['Tables']['communities']['Row']
type CommunityInsert = Database['public']['Tables']['communities']['Insert']

export interface CommunityInput {
  name: string
  description?: string | null
  address?: string | null
  kind?: string | null
  lat?: number | null
  lng?: number | null
}

/**
 * Service para a tabela `communities` (comunidades/territórios).
 *
 * Leitura é pública; escrita só por admin (garantido pelo RLS no banco).
 */
export class CommunityService extends BaseService<Community> {
  constructor() {
    super('communities')
  }

  protected validate(data: Partial<Community>): ServiceResult<Community> {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length < 2) {
        return {
          success: false,
          error: { message: 'Nome precisa de ao menos 2 caracteres', code: 'INVALID_NAME' },
        }
      }
      if (data.name.length > 120) {
        return {
          success: false,
          error: { message: 'Nome pode ter no máximo 120 caracteres', code: 'NAME_TOO_LONG' },
        }
      }
    }
    if (data.description != null && data.description.length > 2000) {
      return {
        success: false,
        error: { message: 'Descrição muito longa (máx. 2000)', code: 'DESCRIPTION_TOO_LONG' },
      }
    }
    return { success: true, data: data as Community }
  }

  /** Lista todas as comunidades (mais recentes / por nome). */
  public async getCommunities(): Promise<ServiceResult<Community[]>> {
    try {
      const client = await this.ensureClient()
      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .order('name', { ascending: true })

      if (error) return this.handleError(error)
      return { success: true, data: (data || []) as Community[] }
    } catch (error) {
      return this.handleError(error)
    }
  }

  public async getCommunityById(id: string): Promise<ServiceResult<Community>> {
    return this.findById(id)
  }

  // As escritas usam o client de serviço (bypassa RLS). A autorização é feita
  // na Server Action (ensureAdmin) antes de chamar estes métodos.
  public async createCommunity(input: CommunityInput): Promise<ServiceResult<Community>> {
    const validation = this.validate({ name: input.name, description: input.description })
    if (!validation.success) return validation

    try {
      const db = createAdminClient()
      const insert: CommunityInsert = {
        name: input.name.trim(),
        description: input.description?.trim() || null,
        address: input.address?.trim() || null,
        kind: input.kind || null,
        lat: input.lat ?? null,
        lng: input.lng ?? null,
      }
      const { data, error } = await db
        .from('communities')
        .insert(insert)
        .select()
        .single()
      if (error) return this.handleError(error)
      return { success: true, data: data as Community }
    } catch (error) {
      return this.handleError(error)
    }
  }

  public async updateCommunity(
    id: string,
    input: Partial<CommunityInput>
  ): Promise<ServiceResult<Community>> {
    try {
      const patch: Database['public']['Tables']['communities']['Update'] = {
        updated_at: new Date().toISOString(),
      }
      if (input.name !== undefined) patch.name = input.name.trim()
      if (input.description !== undefined) patch.description = input.description?.trim() || null
      if (input.address !== undefined) patch.address = input.address?.trim() || null
      if (input.kind !== undefined) patch.kind = input.kind || null
      if (input.lat !== undefined) patch.lat = input.lat
      if (input.lng !== undefined) patch.lng = input.lng

      const db = createAdminClient()
      const { data, error } = await db
        .from('communities')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) return this.handleError(error)
      return { success: true, data: data as Community }
    } catch (error) {
      return this.handleError(error)
    }
  }

  public async deleteCommunity(id: string): Promise<ServiceResult<void>> {
    try {
      const db = createAdminClient()
      const { error } = await db.from('communities').delete().eq('id', id)
      if (error) return this.handleError(error)
      return { success: true }
    } catch (error) {
      return this.handleError(error)
    }
  }
}

let communityServiceInstance: CommunityService | null = null

export function getCommunityService(): CommunityService {
  if (!communityServiceInstance) {
    communityServiceInstance = new CommunityService()
  }
  return communityServiceInstance
}
