'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  updateServiceStatusAction,
  deleteServiceAction,
} from '@/app/(app)/trocas/actions'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { categoryLabel, SERVICE_CATEGORIES } from '@/lib/categories'
import { timeAgo } from '@/lib/utils'
import type { Service } from '@/types'

const STATUS_LABEL: Record<Service['status'], string> = {
  active: 'Na roda',
  matched: 'Combinada',
  completed: 'Concluída',
  cancelled: 'Encerrada',
}

export function MyServiceRow({
  service,
  pendingInterests = 0,
}: {
  service: Service
  pendingInterests?: number
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState<'close' | 'delete' | null>(null)

  async function handleClose() {
    setLoading('close')
    const res = await updateServiceStatusAction(service.id, 'cancelled')
    if (!res.success) toast(res.error, 'erro')
    else {
      toast('Publicação encerrada', 'sucesso')
      router.refresh()
    }
    setLoading(null)
  }

  async function handleDelete() {
    if (!confirm('Remover esta publicação da roda?')) return
    setLoading('delete')
    const res = await deleteServiceAction(service.id)
    if (!res.success) toast(res.error, 'erro')
    else {
      toast('Publicação removida', 'sucesso')
      router.refresh()
    }
    setLoading(null)
  }

  return (
    <article className="rounded-lg border border-palha bg-creme-dark p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge type={service.type === 'offer' ? 'troca' : 'aviso'}>
          {service.type === 'offer' ? 'Oferece' : 'Busca'}
        </Badge>
        <Badge type="categoria">{categoryLabel(SERVICE_CATEGORIES, service.category)}</Badge>
        <Badge type={service.status === 'active' ? 'novo' : 'categoria'}>
          {STATUS_LABEL[service.status]}
        </Badge>
        {pendingInterests > 0 && (
          <Badge type="feira">
            {pendingInterests} interesse{pendingInterests === 1 ? '' : 's'}
          </Badge>
        )}
        <span className="ml-auto font-body text-[11px] text-tinta-light">
          {timeAgo(service.created_at)}
        </span>
      </div>

      <h3 className="mt-2 font-strong text-[15px] font-bold text-tinta">{service.title}</h3>
      <p className="mt-0.5 line-clamp-2 font-body text-[13px] text-tinta-mid">
        {service.description}
      </p>

      {service.status === 'active' && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            loading={loading === 'close'}
            disabled={!!loading}
            onClick={handleClose}
          >
            Encerrar na roda
          </Button>
          <Button
            variant="secondary"
            size="sm"
            loading={loading === 'delete'}
            disabled={!!loading}
            onClick={handleDelete}
          >
            Remover
          </Button>
        </div>
      )}
    </article>
  )
}

export function InterestChatRow({
  chatId,
  name,
  subtitle,
  status,
  href,
}: {
  chatId: string
  name: string
  subtitle: string
  status: 'pending' | 'active' | 'declined' | 'completed'
  href: string
}) {
  const statusLabel =
    status === 'pending'
      ? 'Aguardando'
      : status === 'active'
        ? 'Combinada'
        : status === 'completed'
          ? 'Concluída'
          : 'Recusada'

  const badgeType =
    status === 'pending'
      ? 'feira'
      : status === 'active'
        ? 'troca'
        : 'categoria'

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-palha bg-creme-dark p-3 transition-colors hover:border-ouro"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-body text-[14px] font-medium text-tinta">{name}</p>
        <p className="truncate font-body text-[12px] text-tinta-mid">{subtitle}</p>
      </div>
      <Badge type={badgeType}>{statusLabel}</Badge>
    </Link>
  )
}
