import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { ServiceResult } from './types'
import type { CommunityFundTransactionType } from '@/types'

/**
 * Fundo comunitário (Fase 5) — saldo real, gerido pelo admin da comunidade.
 * Ledger próprio (`community_fund_transactions`), separado de
 * `tekoin_transactions` porque o fundo não é um usuário (sem `user_id`).
 */
class CommunityFundService {
  public async getBalance(communityId: string): Promise<ServiceResult<number>> {
    try {
      const client = await createClient()
      const { data, error } = await client
        .from('community_funds')
        .select('balance')
        .eq('community_id', communityId)
        .maybeSingle()

      if (error) return { success: false, error: { message: error.message } }
      return { success: true, data: (data as { balance: number } | null)?.balance ?? 0 }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return { success: false, error: { message } }
    }
  }

  /**
   * Debita o quanto estiver disponível no fundo — nunca falha por saldo
   * insuficiente, debita o parcial (ou zero). Retorna o quanto foi debitado.
   */
  public async debitIfAvailable(
    communityId: string,
    amount: number,
    type: CommunityFundTransactionType,
    referenceId?: string | null
  ): Promise<ServiceResult<number>> {
    if (amount <= 0) return { success: true, data: 0 }

    const balanceRes = await this.getBalance(communityId)
    if (!balanceRes.success) return { success: false, error: balanceRes.error }
    const debitable = Math.min(balanceRes.data ?? 0, amount)
    if (debitable <= 0) return { success: true, data: 0 }

    try {
      const admin = createAdminClient()
      const { error } = await admin.from('community_fund_transactions').insert({
        community_id: communityId,
        amount: -debitable,
        type,
        reference_id: referenceId ?? null,
      })
      if (error) return { success: false, error: { message: error.message, code: error.code } }
      return { success: true, data: debitable }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return { success: false, error: { message } }
    }
  }

  /** Entrada de saldo no fundo (ex.: aporte manual de um admin). */
  public async credit(
    communityId: string,
    amount: number,
    type: CommunityFundTransactionType,
    referenceId?: string | null
  ): Promise<ServiceResult<void>> {
    if (amount <= 0) return { success: true }

    try {
      const admin = createAdminClient()
      const { error } = await admin.from('community_fund_transactions').insert({
        community_id: communityId,
        amount,
        type,
        reference_id: referenceId ?? null,
      })
      if (error) return { success: false, error: { message: error.message, code: error.code } }
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return { success: false, error: { message } }
    }
  }
}

let communityFundServiceInstance: CommunityFundService | null = null

export function getCommunityFundService(): CommunityFundService {
  if (!communityFundServiceInstance) {
    communityFundServiceInstance = new CommunityFundService()
  }
  return communityFundServiceInstance
}
