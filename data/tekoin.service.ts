import { BaseService } from './base.service'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  tekoinsForRating,
  AVISO_TEKOIN_REWARD,
  AVISO_DAILY_CAP,
  HIGHLIGHT_COST,
  HIGHLIGHT_DURATION_DAYS,
  PRIORITY_COST,
  PRIORITY_DURATION_DAYS,
  BADGE_CATALOG,
} from '@/lib/tekoins'
import type { ServiceResult } from './types'
import type {
  TekoinTransaction,
  TekoinTransactionType,
  TekoinReferenceType,
  TekoinBoostKind,
  TekoinBadge,
} from '@/types'

/**
 * Service para o ledger de Tekoins (`tekoin_transactions`).
 *
 * Toda escrita usa o admin client (service role): não existe policy de
 * insert pra usuário comum — a autorização é validada na Server Action
 * antes de chamar estes métodos, igual o padrão de `TradeService.createTrade`.
 */
export class TekoinService extends BaseService<TekoinTransaction> {
  constructor() {
    super('tekoin_transactions')
  }

  protected validate(data: Partial<TekoinTransaction>): ServiceResult<TekoinTransaction> {
    if (data.amount !== undefined && data.amount === 0) {
      return {
        success: false,
        error: { message: 'Valor da transação não pode ser zero', code: 'INVALID_AMOUNT' },
      }
    }
    return { success: true, data: data as TekoinTransaction }
  }

  /**
   * Credita Tekoin a quem foi avaliado, escalado pela nota recebida.
   * Não grava nada se a tabela de recompensa mapear a nota pra 0.
   */
  public async mintRatingReward(
    toUserId: string,
    fromUserId: string,
    rating: number,
    tradeId: string | null
  ): Promise<ServiceResult<TekoinTransaction | null>> {
    const amount = tekoinsForRating(rating)
    if (amount <= 0) return { success: true, data: null }

    return this.insertTransaction({
      user_id: toUserId,
      counterparty_id: fromUserId,
      amount,
      type: 'earned_rating',
      reference_type: tradeId ? 'trade' : null,
      reference_id: tradeId,
    })
  }

  /**
   * Credita Tekoin base por participar de um mutirão (organizador avaliando
   * presente, ou presente avaliando o organizador de volta) — mesma tabela
   * de avaliação da Fase 1, mintada incondicionalmente: o mutirão acontecer
   * nunca pode depender do saldo de ninguém.
   */
  public async mintMutiraoBaseReward(
    toUserId: string,
    fromUserId: string,
    rating: number,
    mutiraoId: string
  ): Promise<ServiceResult<TekoinTransaction | null>> {
    const amount = tekoinsForRating(rating)
    if (amount <= 0) return { success: true, data: null }

    return this.insertTransaction({
      user_id: toUserId,
      counterparty_id: fromUserId,
      amount,
      type: 'earned_mutirao_base',
      reference_type: 'mutirao',
      reference_id: mutiraoId,
    })
  }

  /**
   * Credita a fatia do extra do mutirão (vindo do fundo comunitário) a um
   * participante presente — crédito plano, não escalado por avaliação.
   */
  public async creditMutiraoExtra(
    userId: string,
    amount: number,
    mutiraoId: string
  ): Promise<ServiceResult<TekoinTransaction | null>> {
    if (amount <= 0) return { success: true, data: null }
    return this.insertTransaction({
      user_id: userId,
      counterparty_id: null,
      amount,
      type: 'earned_mutirao_base',
      reference_type: 'mutirao',
      reference_id: mutiraoId,
    })
  }

  /**
   * Se `raterId` já avaliou `ratedId` neste mutirão (organizador→presente ou
   * presente→organizador, a direção é o que distingue os dois). Usado pra
   * evitar mintar a recompensa duas vezes pra mesma avaliação.
   */
  public async hasMutiraoRating(
    mutiraoId: string,
    ratedId: string,
    raterId: string
  ): Promise<ServiceResult<boolean>> {
    try {
      const client = await this.ensureClient()
      const { data, error } = await client
        .from('tekoin_transactions')
        .select('id')
        .eq('type', 'earned_mutirao_base')
        .eq('reference_id', mutiraoId)
        .eq('user_id', ratedId)
        .eq('counterparty_id', raterId)
        .limit(1)
        .maybeSingle()

      if (error) return this.handleError(error)
      return { success: true, data: data !== null }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Credita Tekoin por publicar um aviso, até o limite diário (anti-spam) —
   * não há outra pessoa validando essa interação, então o ganho é capado.
   */
  public async mintAvisoReward(
    userId: string,
    avisoId: string
  ): Promise<ServiceResult<TekoinTransaction | null>> {
    try {
      const admin = createAdminClient()
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const { count, error } = await admin
        .from('tekoin_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', 'earned_aviso')
        .gte('created_at', startOfDay.toISOString())

      if (error) return this.handleError(error)
      if ((count ?? 0) >= AVISO_DAILY_CAP) return { success: true, data: null }

      return this.insertTransaction({
        user_id: userId,
        counterparty_id: null,
        amount: AVISO_TEKOIN_REWARD,
        type: 'earned_aviso',
        reference_type: 'aviso',
        reference_id: avisoId,
      })
    } catch (error) {
      return this.handleError(error)
    }
  }

  /** Saldo atual (cache materializado em `users.tekoin_balance`). */
  public async getBalance(userId: string): Promise<ServiceResult<number>> {
    try {
      const client = await this.ensureClient()
      const { data, error } = await client
        .from('users')
        .select('tekoin_balance')
        .eq('id', userId)
        .single()

      if (error) return this.handleError(error)
      return { success: true, data: (data as { tekoin_balance: number } | null)?.tekoin_balance ?? 0 }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /** Extrato paginado, mais recente primeiro. */
  public async getLedger(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<ServiceResult<TekoinTransaction[]>> {
    try {
      const client = await this.ensureClient()
      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) return this.handleError(error)
      return { success: true, data: (data ?? []) as TekoinTransaction[] }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Debita Tekoin pra destacar/priorizar um anúncio próprio por alguns dias.
   * Bloqueia se o saldo for insuficiente — diferente da recompensa base,
   * isto é uma compra deliberada, não pode ficar "incompleta".
   */
  public async spendOnBoost(
    userId: string,
    kind: TekoinBoostKind,
    target: { serviceId?: string | null; productId?: string | null }
  ): Promise<ServiceResult<TekoinTransaction>> {
    const cost = kind === 'highlight' ? HIGHLIGHT_COST : PRIORITY_COST
    const durationDays = kind === 'highlight' ? HIGHLIGHT_DURATION_DAYS : PRIORITY_DURATION_DAYS

    const balanceRes = await this.getBalance(userId)
    if (!balanceRes.success) return { success: false, error: balanceRes.error }
    if ((balanceRes.data ?? 0) < cost) {
      return {
        success: false,
        error: { message: 'Saldo de Tekoins insuficiente', code: 'INSUFFICIENT_BALANCE' },
      }
    }

    try {
      const admin = createAdminClient()
      const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()

      const { error: boostError } = await admin.from('tekoin_boosts').insert({
        user_id: userId,
        service_id: target.serviceId ?? null,
        product_id: target.productId ?? null,
        kind,
        expires_at: expiresAt,
      })
      if (boostError) return this.handleError(boostError)

      return this.insertTransaction({
        user_id: userId,
        counterparty_id: null,
        amount: -cost,
        type: kind === 'highlight' ? 'spent_highlight' : 'spent_priority',
        reference_type: target.serviceId ? 'service' : 'product',
        reference_id: target.serviceId ?? target.productId ?? null,
      })
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Ids (entre os fornecidos) com destaque/prioridade ativa agora —
   * usado pelas listagens pra ordenar os anúncios boostados primeiro.
   */
  public async getActiveBoostedIds(
    kind: TekoinBoostKind,
    field: 'service_id' | 'product_id',
    ids: string[]
  ): Promise<ServiceResult<Set<string>>> {
    if (ids.length === 0) return { success: true, data: new Set() }
    try {
      const client = await this.ensureClient()
      const { data, error } = await client
        .from('tekoin_boosts')
        .select(field)
        .eq('kind', kind)
        .in(field, ids)
        .gt('expires_at', new Date().toISOString())

      if (error) return this.handleError(error)
      return {
        success: true,
        data: new Set((data ?? []).map((row: Record<string, string>) => row[field])),
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Concede badges cujo marco de saldo já foi atingido. Idempotente via
   * UNIQUE(user_id, badge_code) — violação é esperada e ignorada quando o
   * badge já tinha sido concedido antes.
   */
  public async checkAndAwardBadges(userId: string): Promise<ServiceResult<string[]>> {
    try {
      const balanceRes = await this.getBalance(userId)
      if (!balanceRes.success) return { success: false, error: balanceRes.error }
      const balance = balanceRes.data ?? 0

      const eligible = BADGE_CATALOG.filter((b) => balance >= b.milestoneTekoins)
      if (eligible.length === 0) return { success: true, data: [] }

      const admin = createAdminClient()
      const awarded: string[] = []
      for (const badge of eligible) {
        const { error } = await admin
          .from('tekoin_badges')
          .insert({ user_id: userId, badge_code: badge.code })
        if (!error) awarded.push(badge.code)
      }
      return { success: true, data: awarded }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Transfere Tekoin do comprador pro vendedor numa negociação da feira —
   * a primeira transferência P2P real do ledger (diferente das recompensas
   * mintadas da Fase 1). Bloqueia se o comprador não tiver saldo: aqui é
   * dinheiro de verdade saindo do bolso de alguém, não pode ficar parcial.
   */
  public async donateOnFeira(
    buyerId: string,
    sellerId: string,
    amount: number,
    productId: string
  ): Promise<ServiceResult<TekoinTransaction>> {
    if (amount <= 0) {
      return { success: false, error: { message: 'Valor inválido', code: 'INVALID_AMOUNT' } }
    }

    const balanceRes = await this.getBalance(buyerId)
    if (!balanceRes.success) return { success: false, error: balanceRes.error }
    if ((balanceRes.data ?? 0) < amount) {
      return {
        success: false,
        error: { message: 'Saldo de Tekoins insuficiente', code: 'INSUFFICIENT_BALANCE' },
      }
    }

    const debit = await this.insertTransaction({
      user_id: buyerId,
      counterparty_id: sellerId,
      amount: -amount,
      type: 'donated_feira',
      reference_type: 'product',
      reference_id: productId,
    })
    if (!debit.success) return debit

    const credit = await this.insertTransaction({
      user_id: sellerId,
      counterparty_id: buyerId,
      amount,
      type: 'donated_feira',
      reference_type: 'product',
      reference_id: productId,
    })
    if (!credit.success) return credit

    return credit
  }

  /**
   * Reordena uma listagem trazendo destaque/prioridade ativos pro topo,
   * preservando a ordem relativa do resto (sort é estável). Usado pelas
   * listagens públicas de trocas/feira.
   */
  public async sortByActiveBoost<T extends { id: string }>(
    items: T[],
    field: 'service_id' | 'product_id'
  ): Promise<T[]> {
    const ids = items.map((item) => item.id)
    const [highlightRes, priorityRes] = await Promise.all([
      this.getActiveBoostedIds('highlight', field, ids),
      this.getActiveBoostedIds('priority', field, ids),
    ])
    const highlighted = highlightRes.success ? highlightRes.data! : new Set<string>()
    const prioritized = priorityRes.success ? priorityRes.data! : new Set<string>()
    if (highlighted.size === 0 && prioritized.size === 0) return items

    const score = (item: T) => (highlighted.has(item.id) ? 2 : 0) + (prioritized.has(item.id) ? 1 : 0)
    return [...items].sort((a, b) => score(b) - score(a))
  }

  /** Badges conquistados pelo usuário, na ordem em que foram ganhos. */
  public async getUserBadges(userId: string): Promise<ServiceResult<TekoinBadge[]>> {
    try {
      const client = await this.ensureClient()
      const { data, error } = await client
        .from('tekoin_badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: true })

      if (error) return this.handleError(error)
      return { success: true, data: (data ?? []) as TekoinBadge[] }
    } catch (error) {
      return this.handleError(error)
    }
  }

  private async insertTransaction(data: {
    user_id: string
    counterparty_id: string | null
    amount: number
    type: TekoinTransactionType
    reference_type: TekoinReferenceType | null
    reference_id: string | null
  }): Promise<ServiceResult<TekoinTransaction>> {
    try {
      const admin = createAdminClient()
      const { data: row, error } = await admin
        .from('tekoin_transactions')
        .insert(data)
        .select()
        .single()

      if (error) return this.handleError(error)
      return { success: true, data: row as TekoinTransaction }
    } catch (error) {
      return this.handleError(error)
    }
  }
}

let tekoinServiceInstance: TekoinService | null = null

export function getTekoinService(): TekoinService {
  if (!tekoinServiceInstance) {
    tekoinServiceInstance = new TekoinService()
  }
  return tekoinServiceInstance
}
