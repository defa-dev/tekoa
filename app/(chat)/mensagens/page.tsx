import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth/session'
import { getConversations } from '@/lib/chat/getConversations'
import { MensagensPanes } from '@/components/features/chat/MensagensPanes'
import { ConversationList } from '@/components/features/chat/ConversationList'
import { ConversationsHeader } from '@/components/features/chat/ConversationsHeader'
import { ChatEmpty } from '@/components/features/chat/ChatEmpty'
import { BottomNav } from '@/components/layout/BottomNav'

export const dynamic = 'force-dynamic'

export default async function MensagensPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const convs = await getConversations(user.id)

  return (
    <>
      <MensagensPanes
        mode="list"
        list={
          <div className="flex h-full flex-col pb-[calc(56px+env(safe-area-inset-bottom))] lg:pb-0">
            <ConversationsHeader />
            <ConversationList {...convs} currentUserId={user.id} />
          </div>
        }
        detail={<ChatEmpty />}
      />
      <BottomNav />
    </>
  )
}
