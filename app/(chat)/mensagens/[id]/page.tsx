import { notFound, redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth/session'
import { getChatService } from '@/data/chat.service'
import { getUserService } from '@/data/user.service'
import { getServiceService } from '@/data/service.service'
import { getProductService } from '@/data/product.service'
import { getConversations } from '@/lib/chat/getConversations'
import { ChatHeader } from '@/components/features/chat/ChatHeader'
import { ChatThread } from '@/components/features/chat/ChatThread'
import { MensagensPanes } from '@/components/features/chat/MensagensPanes'
import { ConversationList } from '@/components/features/chat/ConversationList'
import { ConversationsHeader } from '@/components/features/chat/ConversationsHeader'

export const dynamic = 'force-dynamic'

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const chatRes = await getChatService().getChatById(id)
  if (!chatRes.success || !chatRes.data) notFound()
  const chat = chatRes.data

  // Garante que o usuário participa (defesa extra além do RLS).
  if (chat.participant_1 !== user.id && chat.participant_2 !== user.id) {
    notFound()
  }

  const otherId =
    chat.participant_1 === user.id ? chat.participant_2 : chat.participant_1

  const [otherRes, messagesRes, convs] = await Promise.all([
    getUserService().getUserById(otherId),
    getChatService().getMessages(id, user.id, 100, 0),
    getConversations(user.id),
  ])

  const other = otherRes.success ? otherRes.data : null
  const messages = messagesRes.success ? messagesRes.data ?? [] : []

  // Contexto da conversa (serviço ou produto)
  let subtitle: string | undefined
  let serviceType: 'offer' | 'request' | undefined
  let productAcceptsTekoins = false
  if (chat.service_id) {
    const s = await getServiceService().getServiceById(chat.service_id)
    if (s.success && s.data) {
      subtitle = s.data.title
      serviceType = s.data.type
    }
  } else if (chat.product_id) {
    const p = await getProductService().getProductById(chat.product_id)
    if (p.success && p.data) {
      subtitle = p.data.title
      productAcceptsTekoins = p.data.accepts_tekoins
    }
  }

  return (
    <MensagensPanes
      mode="thread"
      list={
        <div className="flex h-full flex-col">
          <ConversationsHeader />
          <ConversationList {...convs} activeId={id} currentUserId={user.id} />
        </div>
      }
      detail={
        <>
          <ChatHeader
            name={other?.full_name || 'Vizinho(a)'}
            avatarUrl={other?.avatar_url}
            subtitle={subtitle}
            serviceType={serviceType}
            chatStatus={chat.status ?? 'active'}
            otherUserId={otherId}
            serviceId={chat.status === 'active' ? chat.service_id : null}
          />
          <ChatThread
            chatId={id}
            currentUserId={user.id}
            initialMessages={messages}
            chatStatus={chat.status ?? 'active'}
            initiatedBy={chat.initiated_by}
            serviceId={chat.service_id}
            productId={chat.product_id}
            productAcceptsTekoins={productAcceptsTekoins}
            otherUserId={otherId}
            otherUserName={other?.full_name || 'Vizinho(a)'}
          />
        </>
      }
    />
  )
}
