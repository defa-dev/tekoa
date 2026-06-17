'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

interface ChatEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  chat: {
    id: string
    status: 'pending' | 'active' | 'declined' | 'completed'
    participant_1: string
    participant_2: string
    initiated_by: string | null
    last_message_at: string | null
    last_sender_id: string | null
    service_id: string | null
    product_id: string | null
  }
  serviceType: 'offer' | 'request' | null
}

export function NotificationWatcher({ userId }: { userId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const seenRef = useRef(new Set<string>())
  // Chats que já geraram um toast de "novo contato" (interesse/proposta) —
  // a mensagem automática que chega em seguida não precisa de um 2º toast.
  const justNotifiedRef = useRef(new Set<string>())

  useEffect(() => {
    const es = new EventSource('/api/notifications/stream')

    es.onmessage = (event) => {
      try {
        const { type, chat, serviceType } = JSON.parse(event.data) as ChatEvent
        // Inclui last_message_at na chave: sem isso, a 2ª mensagem num mesmo
        // chat "active" cairia no mesmo dedup key da 1ª e seria silenciada.
        const key = `${type}-${chat.id}-${chat.status}-${chat.last_message_at ?? ''}`

        if (seenRef.current.has(key)) return
        seenRef.current.add(key)

        // Novo interesse recebido numa troca: INSERT pending, sou o dono do
        // serviço (participant_2). Mensagem varia se é oferta ou busca.
        if (type === 'INSERT' && chat.status === 'pending' && chat.participant_2 === userId) {
          const message =
            serviceType === 'request'
              ? 'Alguém apareceu pra ajudar na sua busca!'
              : 'Novo interesse na sua oferta!'
          toast(message, 'info')
          justNotifiedRef.current.add(chat.id)
          router.refresh()
          return
        }

        // Nova proposta de negociação de produto: INSERT, sou o dono do
        // anúncio (participant_2).
        if (type === 'INSERT' && chat.product_id && chat.participant_2 === userId) {
          toast('Nova proposta de negociação recebida!', 'info')
          justNotifiedRef.current.add(chat.id)
          router.refresh()
          return
        }

        // Interesse aceito: UPDATE active onde fui eu que demonstrei interesse (participant_1)
        if (type === 'UPDATE' && chat.status === 'active' && chat.participant_1 === userId) {
          toast('Seu interesse foi aceito! Vamos combinar.', 'sucesso')
          router.refresh()
          return
        }

        // Interesse recusado: UPDATE declined onde fui eu que demonstrei interesse
        if (type === 'UPDATE' && chat.status === 'declined' && chat.participant_1 === userId) {
          toast('Seu interesse não foi aceito desta vez.', 'info')
          router.refresh()
          return
        }

        // Nova mensagem de alguém que não sou eu — cobre o resto da conversa,
        // sem repetir o toast de "novo contato" da própria 1ª mensagem.
        if (type === 'UPDATE' && chat.last_sender_id && chat.last_sender_id !== userId) {
          if (justNotifiedRef.current.has(chat.id)) {
            justNotifiedRef.current.delete(chat.id)
            return
          }
          toast('Mensagem recebida!', 'info')
          router.refresh()
          return
        }
      } catch {}
    }

    es.onerror = () => es.close()
    return () => es.close()
  }, [userId, toast, router])

  return null
}
