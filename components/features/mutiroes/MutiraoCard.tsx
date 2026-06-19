import Link from 'next/link'
import { Icon } from '@/components/icons/Icon'
import { Badge } from '@/components/ui/Badge'
import { MutiraoStatusBadge } from './MutiraoStatusBadge'
import { timeAgo } from '@/lib/utils'
import type { MutiraoRequest } from '@/types'

export function MutiraoCard({
  mutirao,
  confirmationCount,
}: {
  mutirao: MutiraoRequest
  confirmationCount: number
}) {
  return (
    <Link
      href={`/mutiroes/${mutirao.id}`}
      className="flex items-start gap-3 rounded-lg border border-palha bg-creme-dark p-3 transition-colors hover:border-ouro"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-terra-light text-terra">
        <Icon name="users" size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-strong text-[14px] font-bold text-tinta">
            {mutirao.title}
          </p>
          <div className="flex shrink-0 items-center gap-1">
            <Badge type="evento">Mutirão</Badge>
            <MutiraoStatusBadge status={mutirao.status} />
          </div>
        </div>
        <p className="mt-0.5 truncate font-body text-[12px] text-tinta-light">
          {mutirao.location || 'local a definir'} · {confirmationCount}/{mutirao.min_confirmations}{' '}
          confirmados · {timeAgo(mutirao.created_at)}
        </p>
      </div>
      <Icon name="chevron-right" size={18} className="text-ouro" />
    </Link>
  )
}
