'use client'

import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/icons/Icon'
import { RatingSheet } from '@/components/features/ratings/RatingSheet'

export function ChatHeader({
  name,
  avatarUrl,
  subtitle,
  otherUserId,
  serviceId,
}: {
  name: string
  avatarUrl?: string | null
  subtitle?: string
  otherUserId: string
  serviceId?: string | null
}) {
  const router = useRouter()
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
        <p className="truncate font-strong text-[15px] font-bold text-tinta">
          {name}
        </p>
        {subtitle && (
          <p className="truncate font-body text-[11px] text-tinta-mid">
            {subtitle}
          </p>
        )}
      </div>
      <RatingSheet
        toUserId={otherUserId}
        toUserName={name}
        serviceId={serviceId}
      />
    </header>
  )
}
