'use client'

import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'
import type { ChatStatus } from '@/types'

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-ouro',
  active: 'bg-musgo',
  declined: 'bg-tinta-light',
  completed: 'bg-tinta-light',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Aguardando resposta',
  active: 'Em andamento',
  declined: 'Recusado',
  completed: 'Encerrada',
}

export function ChatHeader({
  name,
  avatarUrl,
  subtitle,
  serviceType,
  chatStatus,
  otherUserId,
  serviceId,
}: {
  name: string
  avatarUrl?: string | null
  subtitle?: string
  serviceType?: 'offer' | 'request'
  chatStatus?: ChatStatus
  otherUserId: string
  serviceId?: string | null
}) {
  const router = useRouter()

  const isServiceChat = !!subtitle && !!chatStatus && chatStatus !== undefined
  const dotColor = chatStatus ? STATUS_DOT[chatStatus] : undefined
  const statusLabel = chatStatus ? STATUS_LABEL[chatStatus] : undefined
  const typeLabel = serviceType === 'offer' ? 'Oferece' : serviceType === 'request' ? 'Busca' : undefined

  return (
    <header
      className="flex items-center gap-3 border-b border-palha bg-creme px-3 py-2.5"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 10px)' }}
    >
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Voltar para a tela anterior"
        className="flex h-9 w-9 items-center justify-center rounded-md text-tinta hover:bg-creme-dark"
      >
        <Icon name="arrow-left" size={20} />
      </button>

      <Avatar name={name} src={avatarUrl} size={38} />

      <div className="min-w-0 flex-1">
        <p className="truncate font-strong text-[15px] font-bold text-tinta">{name}</p>

        {subtitle && (
          <div className="flex items-center gap-1.5 overflow-hidden">
            {dotColor && (
              <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotColor)} />
            )}
            <p className="truncate font-body text-[11px] text-tinta-mid">
              {statusLabel && isServiceChat ? `${statusLabel} · ` : ''}
              {typeLabel ? `${typeLabel}: ` : ''}{subtitle}
            </p>
          </div>
        )}
      </div>

    </header>
  )
}
