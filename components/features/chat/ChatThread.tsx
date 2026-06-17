'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { InterestReplyBar } from '@/components/features/chat/InterestReplyBar'
import { TradeCloseSheet } from '@/components/features/chat/TradeCloseSheet'
import { Icon } from '@/components/icons/Icon'
import { renderMessageContent } from '@/lib/chat/renderMessageContent'
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
  otherUserId?: string | null
  otherUserName?: string
}

export function ChatThread({
  chatId,
  currentUserId,
  initialMessages,
  chatStatus = 'active',
  initiatedBy,
  serviceId,
  otherUserId,
  otherUserName = 'Vizinho(a)',
}: ChatThreadProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  const isServiceChat = !!serviceId
  const isPending = isServiceChat && chatStatus === 'pending'
  const isDeclined = isServiceChat && chatStatus === 'declined'
  const isCompleted = chatStatus === 'completed'
  const isInitiator = initiatedBy === currentUserId
  const isOwnerPending = isPending && !isInitiator
  const canCompose = !isDeclined && !isPending && !isCompleted

  function appendUnique(msg: Message) {
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
  }

  const markChatRead = useCallback(async () => {
    try {
      await fetch(`/api/messages/${chatId}`, { method: 'POST' })
    } catch (err) {
      console.error('[ChatThread] Error marking chat as read:', err)
    }
  }, [chatId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // SSE: recebe novas mensagens em tempo real
  useEffect(() => {
    const es = new EventSource(`/api/messages/${chatId}/stream`)
    es.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as Message
        appendUnique(message)
      } catch {
        // ignora eventos mal-formados
      }
    }
    es.onerror = () => es.close()
    return () => es.close()
  }, [chatId])

  // Marcar como lido ao entrar
  useEffect(() => {
    markChatRead()
  }, [chatId, markChatRead])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const content = text.trim()
    if (!content || sending || !canCompose) return

    setSending(true)
    const originalText = text
    setText('')

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, content }),
      })

      if (res.ok) {
        const message = await res.json()
        appendUnique(message)
      } else {
        setText(originalText)
        console.error('[ChatThread] Failed to send message:', res.statusText)
      }
    } catch (err) {
      setText(originalText)
      console.error('[ChatThread] Error sending message:', err)
    } finally {
      setSending(false)
    }
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

      {isCompleted && (
        <div className="border-b border-palha bg-creme-dark px-4 py-2.5">
          <div className="flex items-center gap-1.5 text-tinta-mid">
            <Icon name="check-circle" size={14} className="shrink-0 text-musgo" />
            <p className="font-body text-[12px]">Troca encerrada.</p>
          </div>
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
                {renderMessageContent(m.content)}
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {isOwnerPending && <InterestReplyBar chatId={chatId} />}

      {isServiceChat && chatStatus === 'active' && serviceId && otherUserId && (
        <div className="flex justify-center border-t border-palha/50 bg-creme px-4 py-2">
          <TradeCloseSheet
            chatId={chatId}
            serviceId={serviceId}
            otherUserId={otherUserId}
            otherUserName={otherUserName}
            onDone={() => router.refresh()}
          />
        </div>
      )}

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
