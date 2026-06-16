import Link from 'next/link'
import { getCurrentProfile } from '@/lib/auth/session'
import { getProductService } from '@/data/product.service'
import { getMuralService } from '@/data/mural.service'
import { getServiceService } from '@/data/service.service'
import { getCommunityService } from '@/data/community.service'
import { PageHeader } from '@/components/layout/PageHeader'
import { bandGraphicFor } from '@/lib/screenGraphics'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { FeedCard } from '@/components/features/dashboard/FeedCard'
import { CommunityMapGoogle } from '@/components/features/community/CommunityMapGoogle'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/icons/Icon'
import { timeAgo, formatBRL } from '@/lib/utils'

export const dynamic = 'force-dynamic'

function greeting(date = new Date()): string {
  const h = date.getHours()
  if (h < 12) return 'Bom dia,'
  if (h < 18) return 'Boa tarde,'
  return 'Boa noite,'
}

export default async function DashboardPage() {
  const profile = await getCurrentProfile()

  const territory = { viewerCommunity: profile?.location, limit: 6 }
  const [servicesRes, productsRes, muralRes, communitiesRes] = await Promise.all([
    getServiceService().getServicesWithUser(territory),
    getProductService().getProductsWithUser({ ...territory, status: 'available' }),
    getMuralService().getPostsWithUser(territory),
    getCommunityService().getCommunities(),
  ])

  const communities = communitiesRes.success
    ? (communitiesRes.data ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        lat: c.lat,
        lng: c.lng,
      }))
    : []
  const services = servicesRes.success ? servicesRes.data ?? [] : []
  const products = productsRes.success ? productsRes.data ?? [] : []
  const posts = muralRes.success ? muralRes.data ?? [] : []

  type FeedItem = {
    key: string
    createdAt: string
    icon: 'bag' | 'speakerphone' | 'exchange'
    title: string
    meta: string
    href: string
    badge: { label: string; type: 'feira' | 'aviso' | 'evento' | 'troca' }
  }

  const feed: FeedItem[] = [
    ...services.map((s) => ({
      key: `s-${s.id}`,
      createdAt: s.created_at,
      icon: 'exchange' as const,
      title: s.title,
      meta: timeAgo(s.created_at),
      href: `/trocas`,
      badge:
        s.type === 'offer'
          ? ({ label: 'Oferece', type: 'troca' as const })
          : ({ label: 'Busca', type: 'aviso' as const }),
    })),
    ...products.map((p) => ({
      key: `p-${p.id}`,
      createdAt: p.created_at,
      icon: 'bag' as const,
      title: p.title,
      meta: `${formatBRL(p.price)} · ${timeAgo(p.created_at)}`,
      href: `/feira/${p.id}`,
      badge: { label: 'Feira', type: 'feira' as const },
    })),
    ...posts.map((post) => ({
      key: `m-${post.id}`,
      createdAt: post.created_at,
      icon: 'speakerphone' as const,
      title: post.title,
      meta: `${post.type === 'event' ? 'Evento' : 'Aviso'} · ${timeAgo(post.created_at)}`,
      href: `/avisos`,
      badge: {
        label: post.type === 'event' ? 'Evento' : 'Aviso',
        type: post.type === 'event' ? ('evento' as const) : ('aviso' as const),
      },
    })),
  ]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 10)

  const firstName = profile?.full_name?.split(' ')[0] || 'vizinho(a)'

  return (
    <>
      <PageHeader
        graphic={bandGraphicFor('/dashboard')}
        eyebrow={greeting()}
        title={firstName}
        community={profile?.location || 'Defina seu bairro no perfil'}
      />

      <div className="px-4 py-5">
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/trocas/nova"
            className="flex flex-col gap-2 rounded-md border border-palha bg-creme-dark p-3 transition-colors hover:border-ouro"
          >
            <Icon name="exchange" size={20} className="text-terra" />
            <span className="font-strong text-[13px] font-bold text-tinta">
              Trocar serviço
            </span>
          </Link>
          <Link
            href="/feira/novo"
            className="flex flex-col gap-2 rounded-md border border-palha bg-creme-dark p-3 transition-colors hover:border-ouro"
          >
            <Icon name="bag" size={20} className="text-terra" />
            <span className="font-strong text-[13px] font-bold text-tinta">
              Vender na Feira
            </span>
          </Link>
        </div>

        {/* No desktop a comunidade vive no trilho esquerdo; aqui é só mobile/tablet */}
        <div className="mt-6 xl:hidden">
          <SectionLabel>Sua comunidade</SectionLabel>
          <CommunityMapGoogle
            current={profile?.location}
            communities={communities}
          />
        </div>

        <div className="mt-6">
          <SectionLabel>Movimentando o bairro</SectionLabel>

          {feed.length === 0 ? (
            <EmptyState
              icon="leaf"
              title="A roda está só começando"
              description="Seja o primeiro a oferecer um serviço, anunciar na feira ou avisar a comunidade."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {feed.map((item) => (
                <FeedCard
                  key={item.key}
                  icon={item.icon}
                  title={item.title}
                  meta={item.meta}
                  href={item.href}
                  badge={item.badge}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
