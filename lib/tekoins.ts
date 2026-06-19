/**
 * Constantes da economia de Tekoins, compartilhadas entre as fases
 * (avaliação pós-troca hoje; mutirão reusa a mesma tabela depois).
 * Ver docs/feature-tekoins.md para o desenho completo.
 */

export const RATING_TEKOIN_TABLE: Record<number, number> = {
  5: 10,
  4: 7,
  3: 4,
  2: 1,
  1: 0,
}

export function tekoinsForRating(rating: number): number {
  return RATING_TEKOIN_TABLE[rating] ?? 0
}

export const AVISO_TEKOIN_REWARD = 1
export const AVISO_DAILY_CAP = 2

export const HIGHLIGHT_COST = 15
export const HIGHLIGHT_DURATION_DAYS = 3
export const PRIORITY_COST = 10
export const PRIORITY_DURATION_DAYS = 3

export interface BadgeDef {
  code: string
  label: string
  milestoneTekoins: number
}

/** Conquistados automaticamente por marco de saldo acumulado — nunca comprados. */
export const BADGE_CATALOG: BadgeDef[] = [
  { code: 'tekoin_25', label: 'Primeiros passos', milestoneTekoins: 25 },
  { code: 'tekoin_100', label: 'Vizinho de confiança', milestoneTekoins: 100 },
  { code: 'tekoin_300', label: 'Pilar da comunidade', milestoneTekoins: 300 },
]
