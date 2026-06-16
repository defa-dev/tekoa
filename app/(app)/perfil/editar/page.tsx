import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/session'
import { getCommunityService } from '@/data/community.service'
import { TopBar } from '@/components/layout/TopBar'
import { EditProfileForm } from '@/components/features/profile/EditProfileForm'

export const dynamic = 'force-dynamic'

export default async function EditarPerfilPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  const res = await getCommunityService().getCommunities()
  const communities = (res.success ? res.data ?? [] : []).map((c) => c.name)

  return (
    <>
      <TopBar title="Editar perfil" back />
      <EditProfileForm profile={profile} communities={communities} />
    </>
  )
}
