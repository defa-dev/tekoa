import Link from 'next/link'
import { ConversationList } from '@/components/features/chat/ConversationList'
import { Icon } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'
import type { Conversations } from '@/lib/chat/getConversations'

/**
 * Trilho direito (desktop): acesso rápido às conversas a partir de qualquer
 * tela. Um card arredondado, centralizado na coluna e mais baixo que o
 * cabeçalho da página (~2/3 da altura) — não compete com a barra de título.
 */
export function RightRail({
  conversations,
  className,
}: {
  conversations: Conversations
  className?: string
}) {
  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen flex-col px-3 pt-[var(--rail-top,104px)]',
        className
      )}
    >
      <div className="flex h-[66vh] w-full flex-col overflow-hidden rounded-xl border border-palha bg-creme-dark">
        <div className="flex items-center justify-between border-b border-palha px-4 py-3">
          <h2 className="font-display text-[16px] font-bold text-tinta">
            Conversas
          </h2>
          <Link
            href="/mensagens"
            aria-label="Abrir mensagens"
            className="flex h-8 w-8 items-center justify-center rounded-md text-tinta-mid hover:bg-creme hover:text-terra"
          >
            <Icon name="message" size={18} />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          <ConversationList {...conversations} />
        </div>
      </div>
    </aside>
  )
}
