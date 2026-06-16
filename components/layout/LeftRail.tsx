import {
  CommunityMapGoogle,
  type MapCommunity,
} from '@/components/features/community/CommunityMapGoogle'
import { CommunityMarker } from '@/components/graphics/CommunityMarker'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { cn } from '@/lib/utils'

/**
 * Trilho esquerdo (desktop): mapa real das comunidades cadastradas e a lista
 * das comunidades vizinhas.
 */
export function LeftRail({
  current,
  communities,
  className,
}: {
  current?: string | null
  communities: MapCommunity[]
  className?: string
}) {
  const others = communities.filter((c) => c.name !== current).slice(0, 8)

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen overflow-y-auto px-4 pb-5 pt-[var(--rail-top,104px)]',
        className
      )}
    >
      <CommunityMapGoogle
        current={current}
        communities={communities}
        heightClass="h-[58vh]"
      />

      {others.length > 0 && (
        <div className="mt-5">
          <SectionLabel>Comunidades por perto</SectionLabel>
          <ul className="flex flex-col gap-1">
            {others.map((c) => (
              <li
                key={c.id ?? c.name}
                className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-creme-dark"
              >
                <CommunityMarker variant="secondary" size={18} />
                <span className="min-w-0 flex-1 truncate font-body text-[13px] text-tinta">
                  {c.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
