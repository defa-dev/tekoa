import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { CommunityTag } from '@/components/features/territory/CommunityTag'
import { timeAgo } from '@/lib/utils'
import type { MuralPostWithUser } from '@/data/mural.service'

const TYPE_META: Record<string, { label: string; badge: 'evento' | 'aviso' | 'troca' }> = {
  event: { label: 'Evento', badge: 'evento' },
  announcement: { label: 'Campanha', badge: 'aviso' },
  general: { label: 'Recado', badge: 'troca' },
}

export function NoticeCard({ post }: { post: MuralPostWithUser }) {
  const meta = TYPE_META[post.type] ?? TYPE_META.general
  const author = post.user?.full_name || 'Vizinho(a)'
  const community = post.community ?? post.user?.location
  const cover = post.images?.[0]

  return (
    <article className="rounded-lg border border-palha bg-creme-dark p-4">
      <div className="flex items-center gap-2">
        <Badge type={meta.badge}>{meta.label}</Badge>
        {community && <CommunityTag name={community} />}
        <span className="ml-auto shrink-0 font-body text-[11px] text-tinta-light">
          {timeAgo(post.created_at)}
        </span>
      </div>

      <h3 className="mt-2 font-strong text-[16px] font-bold text-tinta">
        {post.title}
      </h3>
      <p className="mt-1 whitespace-pre-wrap font-body text-[13px] leading-relaxed text-tinta-mid">
        {post.content}
      </p>

      {cover && (
        <div className="mt-3 overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt="" className="max-h-64 w-full object-cover" />
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <Avatar name={author} src={post.user?.avatar_url} size={28} />
        <p className="font-body text-[12px] text-tinta-mid">{author}</p>
      </div>
    </article>
  )
}
