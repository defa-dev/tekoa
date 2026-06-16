import Link from 'next/link'
import { getCurrentProfile } from '@/lib/auth/session'
import { getMuralService } from '@/data/mural.service'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/icons/Icon'
import { MuralFeed } from '@/components/features/mural/MuralFeed'
import { TerritoryToggle } from '@/components/features/territory/TerritoryToggle'

export const dynamic = 'force-dynamic'

export default async function AvisosPage({
  searchParams,
}: {
  searchParams: Promise<{ territorio?: string }>
}) {
  const { territorio } = await searchParams
  const all = territorio === 'todos'
  const profile = await getCurrentProfile()

  const res = await getMuralService().getPostsWithUser({
    limit: 100,
    viewerCommunity: profile?.location,
    allTerritories: all,
  })
  const posts = res.success ? res.data ?? [] : []

  return (
    <>
      <TopBar
        title="Mural"
        action={
          <Link href="/avisos/novo">
            <Button size="sm">
              <Icon name="plus" size={16} />
              Avisar
            </Button>
          </Link>
        }
      />
      <div className="px-4 pt-4">
        <TerritoryToggle path="/avisos" all={all} community={profile?.location} />
      </div>
      <MuralFeed posts={posts} />
    </>
  )
}
