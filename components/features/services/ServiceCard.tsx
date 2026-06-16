import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/icons/Icon'
import { InterestButton } from './InterestButton'
import { categoryLabel, SERVICE_CATEGORIES } from '@/lib/categories'
import { timeAgo } from '@/lib/utils'
import type { ServiceWithUser } from '@/data/service.service'

interface ServiceCardProps {
  service: ServiceWithUser
  /** Quando true, mostra o botão de interesse (serviço de outra pessoa). */
  canInteract?: boolean
  /** Selo opcional (ex.: "Combina!") para matches. */
  highlight?: string
  /** Score do match (0-5), exibe como estrelas. */
  matchScore?: number
}

function renderStars(score: number) {
  const stars = Math.round(score * 5 / 4) // normaliza ~0-4 pra ~0-5
  const clamped = Math.max(1, Math.min(5, stars))
  return Array.from({ length: clamped }).map((_, i) => (
    <Icon key={i} name="star" size={14} className="text-ouro fill-ouro" />
  ))
}

export function ServiceCard({ service, canInteract = true, highlight, matchScore }: ServiceCardProps) {
  const name = service.user?.full_name || 'Vizinho(a)'
  const place = service.user?.location || 'comunidade'

  return (
    <article className="rounded-lg border border-palha bg-creme-dark p-3">
      <div className="flex items-center gap-2">
        <Avatar name={name} src={service.user?.avatar_url} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-body text-[13px] font-medium text-tinta">
            {name} · <span className="text-tinta-mid">{place}</span>
          </p>
          <p className="font-body text-[11px] text-tinta-light">
            {timeAgo(service.created_at)}
          </p>
        </div>
        <Badge type={service.type === 'offer' ? 'troca' : 'aviso'}>
          {service.type === 'offer' ? 'Oferece' : 'Busca'}
        </Badge>
      </div>

      <h3 className="mt-3 font-strong text-[15px] font-bold text-tinta">
        {service.title}
      </h3>
      <p className="mt-0.5 line-clamp-2 font-body text-[13px] text-tinta-mid">
        {service.description}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge type="categoria">
          {categoryLabel(SERVICE_CATEGORIES, service.category)}
        </Badge>
        {highlight && <Badge type="novo">{highlight}</Badge>}
        {matchScore !== undefined && (
          <div className="flex items-center gap-0.5">
            {renderStars(matchScore)}
          </div>
        )}
      </div>

      {canInteract && (
        <div className="mt-3 flex justify-end">
          <InterestButton serviceId={service.id} ownerName={name} />
        </div>
      )}
    </article>
  )
}
