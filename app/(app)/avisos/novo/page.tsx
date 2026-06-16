import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/session'
import { getCommunityService } from '@/data/community.service'
import { TopBar } from '@/components/layout/TopBar'
import { NewPostForm } from '@/components/features/mural/NewPostForm'

export const dynamic = 'force-dynamic'

export default async function NovoAvisoPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  const res = await getCommunityService().getCommunities()
  const communities = (res.success ? res.data ?? [] : []).map((c) => c.name)

  return (
    <>
      <TopBar title="Novo aviso" back />
      <NewPostForm
        userId={profile.id}
        communities={communities}
        userCommunity={profile.location}
      />
    </>
  )
}
