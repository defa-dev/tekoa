import Link from 'next/link'
import { getCurrentProfile } from '@/lib/auth/session'
import { getProductService } from '@/data/product.service'
import { getMuralService } from '@/data/mural.service'
import { getServiceService } from '@/data/service.service'
import { getCommunityService } from '@/data/community.service'
import { getTekoinRankingService } from '@/data/tekoin-ranking.service'
import { getBlogService } from '@/data/blog.service'
import { PageHeader } from '@/components/layout/PageHeader'
import { InfoTip } from '@/components/ui/InfoTip'
import { bandGraphicFor } from '@/lib/screenGraphics'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { FeedCard } from '@/components/features/dashboard/FeedCard'
import { CommunityRankingList } from '@/components/features/dashboard/CommunityRankingList'
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
  const [servicesRes, productsRes, muralRes, communitiesRes, rankingRes, latestPostRes] =
    await Promise.all([
      getServiceService().getServicesWithUser(territory),
      getProductService().getProductsWithUser({ ...territory, status: 'available' }),
      getMuralService().getPostsWithUser(territory),
      getCommunityService().getCommunities(),
      getTekoinRankingService().getCommunityRanking(5),
      getBlogService().getPublishedPosts(1),
    ])

  const ranking = rankingRes.success ? rankingRes.data ?? [] : []
  const latestPost = latestPostRes.success ? latestPostRes.data?.[0] ?? null : null
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
        titleInfo={
          <InfoTip label="O que significa Tekoa?">
            Em guarani, <strong className="text-tinta">tekoa</strong> é o lugar
            onde se pode viver o <em>teko</em> — o modo de ser, o jeito próprio
            de existir em comunidade. Não é só &ldquo;aldeia&rdquo;: é território e modo de
            vida como uma coisa só. O nome do app é essa aposta: um lugar pra
            viver a reciprocidade da vizinhança, não só um aplicativo.
          </InfoTip>
        }
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

        {ranking.length > 0 && (
          <div className="mt-6">
            <SectionLabel>Comunidades mais ativas</SectionLabel>
            <CommunityRankingList items={ranking} />
          </div>
        )}

        {latestPost && (
          <div className="mt-6">
            <SectionLabel>Do blog</SectionLabel>
            <Link
              href={`/blog/${latestPost.slug}`}
              className="flex flex-col gap-1 rounded-md border border-palha bg-creme-dark p-3 transition-colors hover:border-ouro"
            >
              <div className="flex items-center gap-1.5 text-terra">
                <Icon name="book" size={16} />
                <span className="font-strong text-[12px] font-bold uppercase tracking-[0.05em]">
                  Novo texto
                </span>
              </div>
              <p className="font-display text-[15px] font-bold text-tinta">
                {latestPost.title}
              </p>
              <p className="font-body text-[13px] text-tinta-mid">
                {latestPost.summary}
              </p>
            </Link>
          </div>
        )}

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
