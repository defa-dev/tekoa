import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth/session'
import { getCurrentProfile } from '@/lib/auth/session'
import { SideNav } from '@/components/layout/SideNav'
import { PageBackground } from '@/components/layout/PageBackground'

/**
 * Layout das mensagens.
 *
 * Desktop: navegação lateral + painel de conversas em duas colunas, ocupando
 * a página toda. Mobile: tela cheia, sem a tab bar (tela de detalhe).
 */
export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getCurrentProfile()

  return (
    <div className="relative flex h-[100svh] bg-creme">
      <PageBackground />
      <SideNav isAdmin={profile?.is_admin ?? false} />
      <div className="relative z-10 flex min-w-0 flex-1 overflow-hidden">
        <div className="flex min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
