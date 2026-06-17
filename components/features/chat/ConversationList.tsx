import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { timeAgo, cn } from '@/lib/utils'
import { stripMessageLinks } from '@/lib/chat/renderMessageContent'
import type { Conversations } from '@/lib/chat/getConversations'

interface ConversationListProps extends Conversations {
  activeId?: string
  currentUserId?: string
}

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

  const isClosed = (status: string | null | undefined) =>
    status === 'completed' || status === 'declined'

  const open = chats.filter((c) => !isClosed(c.status))
  const closed = chats.filter((c) => isClosed(c.status))

  return (
    <div>
      <ul className="divide-y divide-palha px-2">
        {open.map((chat) => (
          <ConversationRow
            key={chat.id}
            chat={chat}
            userMap={userMap}
            activeId={activeId}
            currentUserId={currentUserId}
          />
        ))}
      </ul>

      {closed.length > 0 && (
        <div className="mt-4">
          <div className="px-4">
            <SectionLabel>Encerradas</SectionLabel>
          </div>
          <ul className="divide-y divide-palha px-2 opacity-70">
            {closed.map((chat) => (
              <ConversationRow
                key={chat.id}
                chat={chat}
                userMap={userMap}
                activeId={activeId}
                currentUserId={currentUserId}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function ConversationRow({
  chat,
  userMap,
  activeId,
  currentUserId,
}: {
  chat: Conversations['chats'][number]
  userMap: Conversations['userMap']
  activeId?: string
  currentUserId?: string
}) {
  const other = chat.otherParticipantId ? userMap.get(chat.otherParticipantId) : undefined
  const name = other?.full_name || 'Vizinho(a)'
  const active = chat.id === activeId
  const isService = !!chat.service_id
  const status = chat.status ?? 'active'
  const iInitiated = !!currentUserId && chat.initiated_by === currentUserId
  const pending = isService && status === 'pending'

  let statusHint = ''
  if (pending) {
    statusHint = iInitiated ? 'Aguardando resposta' : 'Novo interesse'
  } else if (isService && status === 'declined') {
    statusHint = 'Recusado'
  } else if (isService && status === 'active') {
    statusHint = 'Em andamento'
  } else if (status === 'completed') {
    statusHint = 'Encerrada'
  }

  const lastMessage = chat.last_message ? stripMessageLinks(chat.last_message) : null
  const preview = statusHint
    ? `${statusHint} · ${lastMessage || 'Conversa iniciada'}`
    : lastMessage || 'Conversa iniciada'

  return (
    <li>
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
            <p className="truncate font-body text-sm font-medium text-tinta">{name}</p>
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
}
