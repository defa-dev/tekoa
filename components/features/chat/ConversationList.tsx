import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { timeAgo, cn } from '@/lib/utils'
import type { Conversations } from '@/lib/chat/getConversations'

interface ConversationListProps extends Conversations {
  activeId?: string
  currentUserId?: string
}

/**
 * Lista de conversas. Destaca a conversa ativa (útil no painel duplo do desktop).
 */
export function ConversationList({
  chats,
  userMap,
  activeId,
  currentUserId,
}: ConversationListProps) {
  if (chats.length === 0) {
    return (
      <EmptyState
        icon="message"
        title="Nenhuma conversa ainda"
        description="Quando você demonstrar interesse numa troca ou produto, a conversa aparece aqui."
      />
    )
  }

  return (
    <ul className="divide-y divide-palha px-2">
      {chats.map((chat) => {
        const other = chat.otherParticipantId
          ? userMap.get(chat.otherParticipantId)
          : undefined
        const name = other?.full_name || 'Vizinho(a)'
        const active = chat.id === activeId
        const isService = !!chat.service_id
        const pending = isService && (chat.status ?? 'active') === 'pending'
        const iInitiated = !!currentUserId && chat.initiated_by === currentUserId

        let statusHint = ''
        if (pending) {
          statusHint = iInitiated ? 'Aguardando resposta' : 'Novo interesse'
        } else if (isService && (chat.status ?? 'active') === 'declined') {
          statusHint = 'Recusado'
        } else if (isService && (chat.status ?? 'active') === 'active') {
          statusHint = 'Troca combinada'
        }

        const preview = statusHint
          ? `${statusHint} · ${chat.last_message || 'Conversa iniciada'}`
          : chat.last_message || 'Conversa iniciada'

        return (
          <li key={chat.id}>
            <Link
              href={`/mensagens/${chat.id}`}
              className={cn(
                'flex items-center gap-3 rounded-md px-2 py-3 transition-colors',
                active ? 'bg-terra-light' : 'hover:bg-creme-dark',
                pending && !iInitiated && 'bg-ouro-light/30'
              )}
            >
              <Avatar name={name} src={other?.avatar_url} size={44} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-body text-sm font-medium text-tinta">
                    {name}
                  </p>
                  {chat.last_message_at && (
                    <span className="ml-auto shrink-0 font-body text-[11px] text-tinta-light">
                      {timeAgo(chat.last_message_at)}
                    </span>
                  )}
                </div>
                <p className="truncate font-body text-[13px] text-tinta-mid">{preview}</p>
              </div>
              {!!chat.unreadCount && chat.unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-terra px-1.5 font-strong text-[11px] font-bold text-creme">
                  {chat.unreadCount}
                </span>
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
