/**
 * Territórios: alcunhas (tipos de comunidade) e alcance das publicações.
 */

export interface Option {
  value: string
  label: string
}

/** Alcunhas — cada território tem seu nome e sua dignidade. */
export const COMMUNITY_KINDS: Option[] = [
  { value: 'aldeia', label: 'Aldeia' },
  { value: 'quilombo', label: 'Quilombo' },
  { value: 'terreiro', label: 'Terreiro' },
  { value: 'favela', label: 'Favela' },
  { value: 'quebrada', label: 'Quebrada' },
  { value: 'comunidade', label: 'Comunidade' },
  { value: 'ocupacao', label: 'Ocupação' },
  { value: 'assentamento', label: 'Assentamento' },
  { value: 'bairro', label: 'Bairro' },
  { value: 'vila', label: 'Vila' },
  { value: 'condominio', label: 'Condomínio' },
  { value: 'predio', label: 'Prédio' },
  { value: 'coletivo', label: 'Coletivo' },
  { value: 'outro', label: 'Outro' },
]

export function communityKindLabel(value?: string | null): string {
  if (!value) return ''
  return COMMUNITY_KINDS.find((k) => k.value === value)?.label ?? value
}

/** Alcance de uma publicação. */
export type Reach = 'own' | 'selected' | 'all'

/**
 * Filtro PostgREST `.or()` de visibilidade para o espectador de uma comunidade.
 * Um registro é visível se: alcance = todos, OU pertence à comunidade, OU a
 * comunidade está na lista de alcance.
 */
export function territoryOrFilter(community: string): string {
  // Evita que vírgula/parênteses no nome quebrem a expressão .or().
  const c = community.replace(/[(),]/g, ' ').trim()
  return `reach.eq.all,community.eq.${c},reach_communities.cs.{${c}}`
}

export const REACH_OPTIONS: { value: Reach; label: string; hint: string }[] = [
  {
    value: 'own',
    label: 'Só na minha quebrada',
    hint: 'Aparece apenas pra quem é do seu território.',
  },
  {
    value: 'selected',
    label: 'Em territórios escolhidos',
    hint: 'Você escolhe quais comunidades também veem.',
  },
  {
    value: 'all',
    label: 'Em todos os territórios',
    hint: 'Aparece pra toda a rede.',
  },
]
