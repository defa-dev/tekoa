import Link from 'next/link'
import { getCurrentProfile } from '@/lib/auth/session'
import { getProductService } from '@/data/product.service'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/icons/Icon'
import { FeiraBrowser } from '@/components/features/products/FeiraBrowser'
import { TerritoryToggle } from '@/components/features/territory/TerritoryToggle'

export const dynamic = 'force-dynamic'

export default async function FeiraPage({
  searchParams,
}: {
  searchParams: Promise<{ territorio?: string }>
}) {
  const { territorio } = await searchParams
  const all = territorio === 'todos'
  const profile = await getCurrentProfile()

  const res = await getProductService().getProductsWithUser({
    status: 'available',
    limit: 100,
    viewerCommunity: profile?.location,
    allTerritories: all,
  })
  const products = res.success ? res.data ?? [] : []

  return (
    <>
      <TopBar
        title="Feira do Rolo"
        action={
          <Link href="/feira/novo">
            <Button size="sm">
              <Icon name="plus" size={16} />
              Anunciar
            </Button>
          </Link>
        }
      />
      <div className="px-4 pt-4">
        <TerritoryToggle path="/feira" all={all} community={profile?.location} />
      </div>
      <FeiraBrowser products={products} />
    </>
  )
}
