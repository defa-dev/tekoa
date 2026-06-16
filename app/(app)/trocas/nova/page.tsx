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
  const communities = (res.success ? res.data ?? [] : []).map((c) => c.name)

  return (
    <>
      <TopBar title="Nova troca" back />
      <NewServiceForm
        communities={communities}
        userCommunity={profile?.location}
      />
    </>
  )
}
