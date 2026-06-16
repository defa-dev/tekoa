import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Alterna o feed entre "minha comunidade" e "todos os territórios" via query
 * param (?territorio=todos). Server-side, sem JS extra.
 */
export function TerritoryToggle({
  path,
  all,
  community,
}: {
  path: string
  all: boolean
  community?: string | null
}) {
  const base =
    'rounded-full px-3.5 py-1.5 font-body text-[12px] font-medium transition-colors'
  return (
    <div className="inline-flex rounded-full border border-palha bg-creme-dark p-0.5">
      <Link
        href={path}
        className={cn(base, !all ? 'bg-terra text-creme' : 'text-tinta-mid')}
      >
        {community || 'Minha comunidade'}
      </Link>
      <Link
        href={`${path}?territorio=todos`}
        className={cn(base, all ? 'bg-terra text-creme' : 'text-tinta-mid')}
      >
        Outros territórios
      </Link>
    </div>
  )
}
