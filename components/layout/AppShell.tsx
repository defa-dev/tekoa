import { SideNav } from './SideNav'
import { BottomNav } from './BottomNav'
import { MoreMenuFab } from './MoreMenuFab'
import { LeftRail } from './LeftRail'
import { RightRail } from './RightRail'
import { RailRow } from './RailRow'
import { PageBackground } from './PageBackground'
import type { Conversations } from '@/lib/chat/getConversations'
import type { MapCommunity } from '@/components/features/community/CommunityMapGoogle'

interface AppShellProps {
  children: React.ReactNode
  community: { current?: string | null; communities: MapCommunity[] }
  conversations: Conversations
  isAdmin?: boolean
}

/**
 * Esqueleto da área autenticada.
 *
 * - Mobile: conteúdo full-width + bottom nav fixa.
 * - Tablet (sm+): side nav à esquerda.
 * - Desktop (xl+): trilhos laterais — mapa da comunidade à esquerda, conversas
 *   à direita — compondo a página, com o conteúdo (feed) ao centro.
 */
export function AppShell({ children, community, conversations, isAdmin = false }: AppShellProps) {
  const unreadMessages = conversations.chats.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0)

  return (
    <div className="relative flex min-h-screen bg-creme">
      <PageBackground />

      <SideNav isAdmin={isAdmin} unreadMessages={unreadMessages} />

      <RailRow
        left={
          <LeftRail
            current={community.current}
            communities={community.communities}
            className="hidden w-[330px] shrink-0 xl:block"
          />
        }
        right={
          <RightRail
            conversations={conversations}
            className="hidden w-[320px] shrink-0 xl:flex"
          />
        }
      >
        <main className="flex w-full max-w-[460px] flex-col pb-[calc(56px+env(safe-area-inset-bottom))] sm:pb-0">
          {children}
        </main>
      </RailRow>

      <BottomNav unreadMessages={unreadMessages} />
      <MoreMenuFab />
    </div>
  )
}
