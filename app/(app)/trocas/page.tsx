import Link from 'next/link'
import { getCurrentProfile } from '@/lib/auth/session'
import { getServiceService } from '@/data/service.service'
import { findMatches } from '@/lib/matching/match'
import { TopBar } from '@/components/layout/TopBar'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/icons/Icon'
import { InfoTip } from '@/components/ui/InfoTip'
import { ServiceCard } from '@/components/features/services/ServiceCard'
import { ServicesBrowser } from '@/components/features/services/ServicesBrowser'
import { TerritoryToggle } from '@/components/features/territory/TerritoryToggle'
import { SearchBar } from '@/components/features/search/SearchBar'

export const dynamic = 'force-dynamic'

export default async function TrocasPage({
  searchParams,
}: {
  searchParams: Promise<{ territorio?: string; q?: string }>
}) {
  const { territorio, q } = await searchParams
  const all = territorio === 'todos'
  const profile = await getCurrentProfile()
  const svc = getServiceService()

  const [mineRes, communityRes] = await Promise.all([
    profile
      ? svc.getUserServices(profile.id, 'active')
      : Promise.resolve({ success: true as const, data: [] }),
    svc.getServicesWithUser({
      limit: 100,
      viewerCommunity: profile?.location,
      allTerritories: all,
      searchQuery: q,
    }),
  ])

  const mine = mineRes.success ? mineRes.data ?? [] : []
  const community = communityRes.success ? communityRes.data ?? [] : []

  const matches = findMatches(mine, community).slice(0, 8)

  return (
    <>
      <TopBar
        title="Trocas"
        titleInfo={
          <InfoTip label="O que representam as trocas?">
            As trocas — o escambo — são o que os Guarani chamam de{' '}
            <strong className="text-tinta">Jopói</strong>, que significa{' '}
            <em>abrir as mãos</em>: a tradição ancestral de dar e receber em
            reciprocidade. Aqui você troca saberes e serviços com a vizinhança,
            sem precisar de dinheiro.
          </InfoTip>
        }
        action={
          <Link href="/trocas/nova">
            <Button size="sm">
              <Icon name="plus" size={16} />
              Nova
            </Button>
          </Link>
        }
      />

      <div className="px-4 py-5">
        {matches.length > 0 && !q && (
          <section className="mb-7">
            <SectionLabel>Combina com você</SectionLabel>
            <div className="flex flex-col gap-3">
              {matches.map((m) => (
                <ServiceCard
                  key={m.service.id}
                  service={m.service}
                  highlight="Combina!"
                />
              ))}
            </div>
          </section>
        )}

        <div className="mb-4">
          <SearchBar placeholder="Buscar trocas..." />
        </div>

        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <p className="font-body text-[10px] font-medium uppercase tracking-[0.07em] text-tinta-mid opacity-70">
              A roda da comunidade
            </p>
            <Link
              href="/trocas/minhas"
              className="font-body text-[12px] text-terra hover:underline"
            >
              Minhas trocas →
            </Link>
          </div>
          <TerritoryToggle path="/trocas" all={all} community={profile?.location} />
        </div>
        <ServicesBrowser services={community} currentUserId={profile?.id} />
      </div>
    </>
  )
}
