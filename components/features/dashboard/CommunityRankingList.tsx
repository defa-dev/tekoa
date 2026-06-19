import { Icon } from '@/components/icons/Icon'
import type { CommunityTekoinRanking } from '@/data/tekoin-ranking.service'

/**
 * Ranking de "comunidades mais ativas" por Tekoins ganhos — só leitura,
 * não move Tekoin de ninguém (Fase 4: fundo comunitário como métrica).
 */
export function CommunityRankingList({ items }: { items: CommunityTekoinRanking[] }) {
  if (items.length === 0) return null

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item, i) => (
        <div
          key={item.community}
          className="flex items-center gap-3 rounded-lg border border-palha bg-creme-dark px-3 py-2.5"
        >
          <span className="font-strong text-[13px] font-bold text-tinta-light">{i + 1}º</span>
          <span className="flex-1 font-body text-[13px] text-tinta">{item.community}</span>
          <div className="flex items-center gap-1 text-ouro">
            <Icon name="coin" size={16} />
            <span className="font-strong text-[13px] font-bold text-terra">{item.totalEarned}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
