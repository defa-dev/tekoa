import { createClient } from '@/lib/supabase/server'
import type { ServiceResult } from './types'

export interface CommunityTekoinRanking {
  community: string
  totalEarned: number
}

/**
 * Leitura da view `community_tekoin_totals` (Fase 4) — métrica de
 * transparência, não move Tekoin de ninguém. Não estende BaseService: é
 * uma view sem `id`, só leitura, não se encaixa no CRUD genérico.
 */
class TekoinRankingService {
  public async getCommunityRanking(limit = 10): Promise<ServiceResult<CommunityTekoinRanking[]>> {
    try {
      const client = await createClient()
      const { data, error } = await client
        .from('community_tekoin_totals')
        .select('*')
        .limit(limit)

      if (error) {
        return { success: false, error: { message: error.message, code: error.code } }
      }

      return {
        success: true,
        data: ((data ?? []) as { community: string; total_earned: number }[]).map((row) => ({
          community: row.community,
          totalEarned: row.total_earned,
        })),
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return { success: false, error: { message } }
    }
  }
}

let tekoinRankingServiceInstance: TekoinRankingService | null = null

export function getTekoinRankingService(): TekoinRankingService {
  if (!tekoinRankingServiceInstance) {
    tekoinRankingServiceInstance = new TekoinRankingService()
  }
  return tekoinRankingServiceInstance
}
