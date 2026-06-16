import { cn } from '@/lib/utils'

/**
 * Painel de mensagens em duas colunas.
 *
 * - Desktop (lg+): lista à esquerda (fixa) + conversa/placeholder à direita —
 *   compõe a página inteira.
 * - Mobile/tablet: mostra apenas um lado por vez (colapsa), conforme o `mode`:
 *   na lista mostra a lista; na conversa mostra a conversa.
 */
export function MensagensPanes({
  list,
  detail,
  mode,
}: {
  list: React.ReactNode
  detail: React.ReactNode
  mode: 'list' | 'thread'
}) {
  return (
    <div className="flex h-full w-full">
      <aside
        className={cn(
          'h-full w-full flex-col overflow-y-auto border-palha bg-creme/70 lg:flex lg:w-[340px] lg:shrink-0 lg:border-r',
          mode === 'thread' ? 'hidden lg:flex' : 'flex'
        )}
      >
        {list}
      </aside>

      <section
        className={cn(
          'h-full min-w-0 flex-1 flex-col',
          mode === 'list' ? 'hidden lg:flex' : 'flex'
        )}
      >
        {detail}
      </section>
    </div>
  )
}
