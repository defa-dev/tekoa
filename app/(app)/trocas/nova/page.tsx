import { getCurrentProfile } from '@/lib/auth/session'
import { getCommunityService } from '@/data/community.service'
import { TopBar } from '@/components/layout/TopBar'
import { NewServiceForm } from '@/components/features/services/NewServiceForm'

export const dynamic = 'force-dynamic'

export default async function NovaTrocaPage() {
  const [profile, res] = await Promise.all([
    getCurrentProfile(),
    getCommunityService().getCommunities(),
  ])
  const allCommunities = res.success ? res.data ?? [] : []
  const communities = allCommunities.map((c) => c.name)
  const formalCommunities = allCommunities.map((c) => ({ id: c.id, name: c.name }))

  return (
    <>
      <TopBar title="Nova troca" back />
      <NewServiceForm
        communities={communities}
        formalCommunities={formalCommunities}
        userCommunity={profile?.location}
      />
    </>
  )
}
