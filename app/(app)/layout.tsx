import { redirect } from 'next/navigation'
import { getAuthUser, getCurrentProfile } from '@/lib/auth/session'
import { getCommunityService } from '@/data/community.service'
import { getConversations } from '@/lib/chat/getConversations'
import { getTekoinService } from '@/data/tekoin.service'
import { AppShell } from '@/components/layout/AppShell'
import { NotificationWatcher } from '@/components/features/notifications/NotificationWatcher'
import { TekoinBalanceProvider } from '@/components/layout/TekoinBalanceContext'

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

  const [profile, communitiesRes, conversationsResult, balanceRes] = await Promise.all([
    getCurrentProfile(),
    getCommunityService().getCommunities(),
    getConversations(user.id).catch(() => ({ chats: [], userMap: new Map() })),
    getTekoinService().getBalance(user.id),
  ])

  const conversations = conversationsResult || { chats: [], userMap: new Map() }
  const tekoinBalance = balanceRes.success ? balanceRes.data ?? 0 : 0

  const communities = communitiesRes.success
    ? (communitiesRes.data ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        lat: c.lat,
        lng: c.lng,
      }))
    : []

  return (
    <TekoinBalanceProvider value={tekoinBalance}>
      <AppShell
        community={{ current: profile?.location, communities }}
        conversations={conversations}
        isAdmin={profile?.is_admin ?? false}
      >
        <NotificationWatcher userId={user.id} />
        {children}
      </AppShell>
    </TekoinBalanceProvider>
  )
}
