/**
 * Utilitários gerais compartilhados pela UI.
 */

export type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | ClassValue[]

/**
 * Concatena classes condicionais de forma simples (sem dependências externas).
 * Mantemos uma implementação própria por soberania técnica: menos dependências
 * de terceiros, mais controle sobre o território do código.
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = []
  for (const input of inputs) {
    if (!input) continue
    if (Array.isArray(input)) {
      const nested = cn(...input)
      if (nested) out.push(nested)
    } else {
      out.push(String(input))
    }
  }
  return out.join(' ')
}

/**
 * Formata um instante ISO em tempo relativo curto, em português ("há 2h").
 */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime()
  const diffMs = now.getTime() - then
  const sec = Math.max(0, Math.floor(diffMs / 1000))
  if (sec < 60) return 'agora'
  const min = Math.floor(sec / 60)
  if (min < 60) return `há ${min}min`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `há ${hour}h`
  const day = Math.floor(hour / 24)
  if (day < 7) return `há ${day}d`
  const week = Math.floor(day / 7)
  if (week < 5) return `há ${week}sem`
  const month = Math.floor(day / 30)
  if (month < 12) return `há ${month}mes${month > 1 ? 'es' : ''}`
  const year = Math.floor(day / 365)
  return `há ${year}ano${year > 1 ? 's' : ''}`
}

/**
 * Formata um número como moeda brasileira (R$).
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Gera um identificador único razoável para o ambiente do protótipo.
 */
export function uid(prefix = 'id'): string {
  const rand = Math.random().toString(36).slice(2, 10)
  const time = Date.now().toString(36)
  return `${prefix}_${time}_${rand}`
}
