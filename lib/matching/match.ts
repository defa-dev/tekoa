/**
 * Algoritmo de matching de serviços (Tinder de Trocas).
 *
 * Funções puras, sem dependência de banco — fáceis de testar. A camada de
 * dados (ServiceService) busca os candidatos e delega a decisão para cá.
 *
 * Princípio de circularidade: a roda gira quando um pedido encontra uma
 * oferta complementar perto de casa. Quem oferece encontra quem busca, e
 * vice-versa — reciprocidade, não acúmulo.
 */

export interface MatchableService {
  id: string
  user_id: string
  title: string
  description: string
  type: 'offer' | 'request'
  category: string
  proximity: number
  created_at: string
}

export interface ScoredMatch<T extends MatchableService = MatchableService> {
  service: T
  score: number
  /** Ids dos serviços do próprio usuário que casaram com este candidato. */
  matchedWith: string[]
}

/**
 * Dois serviços são compatíveis quando:
 * - são de usuários diferentes;
 * - têm tipos opostos (uma oferta para um pedido, e vice-versa);
 * - pertencem à mesma categoria.
 */
export function isCompatible(
  a: Pick<MatchableService, 'user_id' | 'type' | 'category'>,
  b: Pick<MatchableService, 'user_id' | 'type' | 'category'>
): boolean {
  if (a.user_id === b.user_id) return false
  if (a.type === b.type) return false
  return a.category === b.category
}

/**
 * Extrai palavras significativas (>= 4 letras) de um texto, em minúsculas.
 */
export function keywords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 4)
  )
}

/**
 * Sobreposição de palavras-chave entre dois textos (0..1) — Jaccard.
 */
export function keywordOverlap(textA: string, textB: string): number {
  const a = keywords(textA)
  const b = keywords(textB)
  if (a.size === 0 || b.size === 0) return 0
  let inter = 0
  for (const w of a) if (b.has(w)) inter++
  const union = a.size + b.size - inter
  return union === 0 ? 0 : inter / union
}

/**
 * Pontua um candidato em relação aos serviços do usuário.
 * Base 1.0 por compatibilidade de categoria/tipo, + bônus por afinidade de
 * texto e por proximidade declarada menor (mais local = mais alto).
 */
function scoreCandidate(
  candidate: MatchableService,
  anchors: MatchableService[]
): { score: number; matchedWith: string[] } {
  const matchedWith: string[] = []
  let best = 0

  for (const anchor of anchors) {
    if (!isCompatible(anchor, candidate)) continue
    matchedWith.push(anchor.id)

    const affinity = keywordOverlap(
      `${anchor.title} ${anchor.description}`,
      `${candidate.title} ${candidate.description}`
    )
    // proximidade: 1 (vizinho) → bônus alto; 20km → bônus baixo
    const localBonus = 1 / (1 + candidate.proximity)
    const score = 1 + affinity * 2 + localBonus * 0.5
    if (score > best) best = score
  }

  return { score: best, matchedWith }
}

/**
 * Encontra e ordena os candidatos compatíveis com os serviços do usuário.
 *
 * @param userServices serviços ativos do próprio usuário (âncoras)
 * @param candidates serviços de outros usuários (já filtrados como ativos)
 * @returns candidatos compatíveis, ordenados por score desc e recência
 */
export function findMatches<
  A extends MatchableService,
  C extends MatchableService,
>(userServices: A[], candidates: C[]): ScoredMatch<C>[] {
  const result: ScoredMatch<C>[] = []

  for (const candidate of candidates) {
    const { score, matchedWith } = scoreCandidate(candidate, userServices)
    if (matchedWith.length === 0) continue
    result.push({ service: candidate, score, matchedWith })
  }

  result.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return +new Date(b.service.created_at) - +new Date(a.service.created_at)
  })

  return result
}
