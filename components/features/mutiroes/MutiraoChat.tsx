'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sendMutiraoMessageAction } from '@/app/(app)/mutiroes/actions'
import { Icon } from '@/components/icons/Icon'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import type { MutiraoMessage } from '@/types'

/**
 * Chat em grupo do mutirão — tabela própria, sem tempo real (diferente do
 * chat 1:1): atualiza via `router.refresh()` após enviar.
 */
export function MutiraoChat({
  mutiraoId,
  currentUserId,
  messages,
  userNames,
}: {
  mutiraoId: string
  currentUserId: string
  messages: MutiraoMessage[]
  userNames: Record<string, string>
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = content.trim()
    if (!text) return

    setSending(true)
    const res = await sendMutiraoMessageAction(mutiraoId, text)
    setSending(false)

    if (!res.success) {
      toast(res.error, 'erro')
      return
    }
    setContent('')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex max-h-[360px] flex-col gap-2 overflow-y-auto rounded-lg border border-palha bg-creme-dark p-3">
        {messages.length === 0 ? (
          <p className="py-4 text-center font-body text-[13px] text-tinta-light">
            Nenhuma mensagem ainda. Combine os detalhes por aqui.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === currentUserId
            return (
              <div
                key={m.id}
                className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}
              >
                <span className="mb-0.5 font-body text-[11px] text-tinta-light">
                  {mine ? 'Você' : userNames[m.sender_id] || 'Vizinho(a)'}
                </span>
                <p
                  className={cn(
                    'max-w-[80%] rounded-lg px-3 py-2 font-body text-[13px]',
                    mine ? 'bg-terra text-creme' : 'bg-creme text-tinta border border-palha'
                  )}
                >
                  {m.content}
                </p>
              </div>
            )
          })
        )}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva uma mensagem..."
          maxLength={1000}
          className="flex-1 rounded-md border border-palha bg-creme-dark px-3 py-2.5 font-body text-sm text-tinta placeholder:text-tinta-light focus:border-terra focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          aria-label="Enviar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-terra text-creme transition-transform active:scale-95 disabled:opacity-40"
        >
          <Icon name="send" size={18} />
        </button>
      </form>
    </div>
  )
}
