'use client'

import { useEffect, useRef, useState } from 'react'
import { sendMessageAction, markChatReadAction } from '@/app/(app)/mensagens/actions'
import { useRealtimeNewMessages } from '@/lib/hooks/useRealtimeMessages'
import { InterestReplyBar } from '@/components/features/chat/InterestReplyBar'
import { Icon } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'
import type { ChatStatus } from '@/types'
import type { Message } from '@/types'

interface ChatThreadProps {
  chatId: string
  currentUserId: string
  initialMessages: Message[]
  chatStatus?: ChatStatus
  initiatedBy?: string | null
  serviceId?: string | null
}

/**
 * Conversa em tempo real. Respeita o fluxo de interesse pendente em trocas.
 */
export function ChatThread({
  chatId,
  currentUserId,
  initialMessages,
  chatStatus = 'active',
  initiatedBy,
  serviceId,
}: ChatThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  const isServiceChat = !!serviceId
  const isPending = isServiceChat && chatStatus === 'pending'
  const isDeclined = isServiceChat && chatStatus === 'declined'
  const isInitiator = initiatedBy === currentUserId
  const isOwnerPending = isPending && !isInitiator
  const canCompose = !isDeclined && !isPending

  function appendUnique(msg: Message) {
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
  }

  useRealtimeNewMessages(chatId, (msg) => {
    appendUnique(msg)
    if (msg.sender_id !== currentUserId) {
      markChatReadAction(chatId)
    }
  })

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    markChatReadAction(chatId)
  }, [chatId])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const content = text.trim()
    if (!content || sending || !canCompose) return

    setSending(true)
    setText('')
    const res = await sendMessageAction(chatId, content)
    if (res.success) {
      appendUnique({
        id: res.data.id,
        chat_id: chatId,
        sender_id: currentUserId,
        content,
        read: false,
        created_at: new Date().toISOString(),
      })
    } else {
      setText(content)
    }
    setSending(false)
  }

  return (
    <div className="flex flex-1 flex-col">
      {isPending && isInitiator && (
        <div className="border-b border-palha bg-ouro-light/40 px-4 py-2.5">
          <p className="font-body text-[12px] text-tinta-mid">
            Interesse enviado — aguardando resposta do vizinho.
          </p>
        </div>
      )}

      {isDeclined && (
        <div className="border-b border-palha bg-creme-dark px-4 py-2.5">
          <p className="font-body text-[12px] text-tinta-mid">
            Este interesse foi recusado. A oferta continua na roda para outros.
          </p>
        </div>
      )}

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId
          return (
            <div
              key={m.id}
              className={cn('flex', mine ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[78%] rounded-lg px-3 py-2 font-body text-[13px] whitespace-pre-wrap',
                  mine
                    ? 'rounded-br-sm bg-terra text-creme'
                    : 'rounded-bl-sm border border-palha bg-creme-dark text-tinta'
                )}
              >
                {m.content}
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {isOwnerPending && <InterestReplyBar chatId={chatId} />}

      {canCompose && (
        <form
          onSubmit={handleSend}
          className="sticky bottom-0 flex items-center gap-2 border-t border-palha bg-creme px-3 py-2.5"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 10px)' }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escreva uma mensagem..."
            className="flex-1 rounded-full border border-palha bg-creme-dark px-4 py-2.5 font-body text-sm text-tinta placeholder:text-tinta-light focus:border-terra focus:outline-none"
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            aria-label="Enviar"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terra text-creme transition-colors hover:bg-terra-dark disabled:opacity-40"
          >
            <Icon name="send" size={18} />
          </button>
        </form>
      )}
    </div>
  )
}
