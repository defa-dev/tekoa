import Link from 'next/link'
import { Icon, type IconName } from '@/components/icons/Icon'
import { Badge, type BadgeType } from '@/components/ui/Badge'

export interface FeedCardProps {
  icon: IconName
  title: string
  meta: string
  href?: string
  badge?: {
    label: string
    type: BadgeType
  }
}

/**
 * Card unificado do feed do dashboard (serviço / produto / aviso).
 */
export function FeedCard({ icon, title, meta, href, badge }: FeedCardProps) {
  const inner = (
    <div className="flex items-center gap-3 rounded-lg border border-palha bg-creme-dark p-3 transition-colors hover:border-ouro">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-terra-light text-terra">
        <Icon name={icon} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-strong text-[13px] font-bold text-tinta">
          {title}
        </p>
        <p className="truncate font-body text-[11px] text-tinta-light">{meta}</p>
      </div>
      {badge && <Badge type={badge.type}>{badge.label}</Badge>}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    )
  }
  return inner
}
