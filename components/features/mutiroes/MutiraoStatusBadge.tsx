import { Badge } from '@/components/ui/Badge'
import type { MutiraoStatus } from '@/types'

const LABEL: Record<MutiraoStatus, string> = {
  open: 'Aberto',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

export function MutiraoStatusBadge({ status }: { status: MutiraoStatus }) {
  const type = status === 'completed' ? 'novo' : status === 'cancelled' ? 'troca' : 'evento'
  return <Badge type={type}>{LABEL[status]}</Badge>
}
