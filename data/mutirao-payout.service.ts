import { getMutiraoService } from './mutirao.service'
import { getTekoinService } from './tekoin.service'
import { getCommunityAdminService } from './community-admin.service'
import { getCommunityFundService } from './community-fund.service'
import type { ServiceResult } from './types'

export interface AttendanceRating {
  userId: string
  attended: boolean
  rating: number
}

export interface MutiraoPayoutResult {
  baseAwarded: { userId: string; amount: number }[]
  extraDistributed: number
}

/**
 * Orquestra o fechamento de um mutirão: marca presença, minta a recompensa
 * base por participante presente (incondicional, tabela da Fase 1) e
 * distribui um extra opcional vindo do fundo comunitário — só se o
 * organizador for admin da comunidade do mutirão, e nunca bloqueia o
 * fechamento se o fundo não tiver saldo suficiente.
 */
class MutiraoPayoutService {
  public async closeMutirao(
    mutiraoId: string,
    organizerId: string,
    attendance: AttendanceRating[],
    extraRequested = 0
  ): Promise<ServiceResult<MutiraoPayoutResult>> {
    const mutiraoRes = await getMutiraoService().getMutiraoById(mutiraoId)
    if (!mutiraoRes.success || !mutiraoRes.data) {
      return { success: false, error: mutiraoRes.error || { message: 'Mutirão não encontrado' } }
    }
    const mutirao = mutiraoRes.data
    if (mutirao.status === 'completed') {
      return { success: false, error: { message: 'Mutirão já foi fechado', code: 'ALREADY_CLOSED' } }
    }

    const markRes = await getMutiraoService().markAttendance(
      mutiraoId,
      organizerId,
      attendance.map((a) => ({ userId: a.userId, attended: a.attended }))
    )
    if (!markRes.success) return { success: false, error: markRes.error }

    const present = attendance.filter((a) => a.attended)
    const tekoinSvc = getTekoinService()

    const baseAwarded: { userId: string; amount: number }[] = []
    for (const p of present) {
      const res = await tekoinSvc.mintMutiraoBaseReward(p.userId, organizerId, p.rating, mutiraoId)
      if (res.success && res.data) baseAwarded.push({ userId: p.userId, amount: res.data.amount })
    }

    let extraDistributed = 0
    if (extraRequested > 0 && present.length > 0 && mutirao.community_id) {
      const isAdmin = await getCommunityAdminService().isCommunityAdmin(
        mutirao.community_id,
        organizerId
      )
      if (isAdmin) {
        const debitRes = await getCommunityFundService().debitIfAvailable(
          mutirao.community_id,
          extraRequested,
          'mutirao_extra',
          mutiraoId
        )
        if (debitRes.success && debitRes.data) {
          extraDistributed = debitRes.data
          const perPerson = Math.floor(extraDistributed / present.length)
          if (perPerson > 0) {
            for (const p of present) {
              await tekoinSvc.creditMutiraoExtra(p.userId, perPerson, mutiraoId)
            }
          }
        }
      }
    }

    return { success: true, data: { baseAwarded, extraDistributed } }
  }
}

let mutiraoPayoutServiceInstance: MutiraoPayoutService | null = null

export function getMutiraoPayoutService(): MutiraoPayoutService {
  if (!mutiraoPayoutServiceInstance) {
    mutiraoPayoutServiceInstance = new MutiraoPayoutService()
  }
  return mutiraoPayoutServiceInstance
}
