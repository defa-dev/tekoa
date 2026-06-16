import Link from 'next/link'
import { Icon } from '@/components/icons/Icon'

/**
 * Cabeçalho da coluna de conversas. No mobile mostra um voltar para o início.
 */
export function ConversationsHeader() {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-palha bg-creme/95 px-3 py-3 backdrop-blur">
      <Link
        href="/dashboard"
        aria-label="Voltar ao início"
        className="-ml-1 flex h-9 w-9 items-center justify-center rounded-md text-tinta hover:bg-creme-dark lg:hidden"
      >
        <Icon name="arrow-left" size={20} />
      </Link>
      <h1 className="font-display text-[18px] font-bold text-tinta">Conversas</h1>
    </div>
  )
}
