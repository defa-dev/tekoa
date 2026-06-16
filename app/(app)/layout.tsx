import { redirect } from 'next/navigation'
import { getAuthUser, getCurrentProfile } from '@/lib/auth/session'
import { getCommunityService } from '@/data/community.service'
import { getConversations } from '@/lib/chat/getConversations'
import { AppShell } from '@/components/layout/AppShell'

/**
 * Layout da área autenticada. O middleware já protege estas rotas; aqui
 * reforçamos a guarda e montamos o esqueleto (trilhos de comunidade e
 * conversas) compartilhado por todas as telas.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const [profile, communitiesRes, conversations] = await Promise.all([
    getCurrentProfile(),
    getCommunityService().getCommunities(),
    getConversations(user.id),
  ])

  const communities = communitiesRes.success
    ? (communitiesRes.data ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        lat: c.lat,
        lng: c.lng,
      }))
    : []

  return (
    <AppShell
      community={{ current: profile?.location, communities }}
      conversations={conversations}
    >
      {children}
    </AppShell>
  )
}
