import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/session'
import { getCommunityService } from '@/data/community.service'
import { TopBar } from '@/components/layout/TopBar'
import { NewProductForm } from '@/components/features/products/NewProductForm'

export const dynamic = 'force-dynamic'

export default async function NovoProdutoPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  const res = await getCommunityService().getCommunities()
  const communities = (res.success ? res.data ?? [] : []).map((c) => c.name)

  return (
    <>
      <TopBar title="Anunciar na feira" back />
      <NewProductForm
        userId={profile.id}
        communities={communities}
        userCommunity={profile.location}
      />
    </>
  )
}
