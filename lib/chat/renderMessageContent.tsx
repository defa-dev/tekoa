import Link from 'next/link'
import type { ReactNode } from 'react'

// Suporta apenas o subconjunto `[texto](/rota)` — link relativo interno.
// Mensagens automáticas (ex.: negociação de produto) usam esse formato.
const LINK_PATTERN = /\[([^\]]+)\]\((\/[^\s)]+)\)/g

/**
 * Renderiza o conteúdo de uma mensagem de chat, convertendo links markdown
 * simples em `<Link>` do Next.js. Texto fora do padrão é exibido como está.
 */
export function renderMessageContent(content: string): ReactNode[] {
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  LINK_PATTERN.lastIndex = 0
  while ((match = LINK_PATTERN.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index))
    }
    const [full, label, href] = match
    parts.push(
      <Link key={key++} href={href} className="underline underline-offset-2">
        {label}
      </Link>
    )
    lastIndex = match.index + full.length
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex))
  }

  return parts
}

/**
 * Remove a sintaxe de link markdown de uma mensagem, mantendo só o texto —
 * usado em previews (lista de conversas) onde não há como renderizar `<Link>`.
 */
export function stripMessageLinks(content: string): string {
  return content.replace(LINK_PATTERN, '$1')
}
