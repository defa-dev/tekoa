import type { ReactNode } from 'react'

// Suporta apenas `**negrito**` — sem dependência de markdown completa, no
// mesmo espírito de `lib/chat/renderMessageContent.tsx`. Conteúdo do post
// é escrito pelo admin, não por usuários, então o subconjunto é por escolha
// editorial, não por limitação de confiança.
const BOLD_PATTERN = /\*\*([^*]+)\*\*/g

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  BOLD_PATTERN.lastIndex = 0
  while ((match = BOLD_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(<strong key={`${keyPrefix}-${key++}`}>{match[1]}</strong>)
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

/**
 * Divide o conteúdo de um post em parágrafos (linha em branco separa) e
 * resolve `**negrito**` dentro de cada um.
 */
export function renderPostContent(content: string): ReactNode[] {
  return content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((paragraph, i) => <p key={i}>{renderInline(paragraph, `p${i}`)}</p>)
}
