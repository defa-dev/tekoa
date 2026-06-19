import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { ServiceResult } from './types'
import type { CommunityAdmin } from '@/types'

/**
 * Admin de comunidade — atribuído por um admin da plataforma
 * (`users.is_admin`). Default: quem cadastrou a comunidade
 * (`communities.created_by`) até alguém ser definido explicitamente.
 * Eleição por voto dos moradores fica como evolução futura.
 */
class CommunityAdminService {
  public async assignAdmin(
    communityId: string,
    userId: string,
    assignedBy: string
  ): Promise<ServiceResult<CommunityAdmin>> {
    try {
      const admin = createAdminClient()
      const { data, error } = await admin
        .from('community_admins')
        .upsert(
          { community_id: communityId, user_id: userId, assigned_by: assignedBy },
          { onConflict: 'community_id,user_id' }
        )
        .select()
        .single()

      if (error) return { success: false, error: { message: error.message, code: error.code } }
      return { success: true, data: data as CommunityAdmin }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return { success: false, error: { message } }
    }
  }

  /** Admin explícito da comunidade, com fallback pro criador do cadastro. */
  public async getAdminForCommunity(communityId: string): Promise<ServiceResult<string | null>> {
    try {
      const client = await createClient()
      const { data, error } = await client
        .from('community_admins')
        .select('user_id')
        .eq('community_id', communityId)
        .limit(1)
        .maybeSingle()

      if (error) return { success: false, error: { message: error.message } }
      if (data) return { success: true, data: (data as { user_id: string }).user_id }

      const communityRes = await client
        .from('communities')
        .select('created_by')
        .eq('id', communityId)
        .maybeSingle()

      if (communityRes.error) {
        return { success: false, error: { message: communityRes.error.message } }
      }
      return {
        success: true,
        data: (communityRes.data as { created_by: string | null } | null)?.created_by ?? null,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return { success: false, error: { message } }
    }
  }

  public async isCommunityAdmin(communityId: string, userId: string): Promise<boolean> {
    const res = await this.getAdminForCommunity(communityId)
    return res.success && res.data === userId
  }
}

let communityAdminServiceInstance: CommunityAdminService | null = null

export function getCommunityAdminService(): CommunityAdminService {
  if (!communityAdminServiceInstance) {
    communityAdminServiceInstance = new CommunityAdminService()
  }
  return communityAdminServiceInstance
}
