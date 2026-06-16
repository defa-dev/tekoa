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
  }
}

export function NotificationWatcher({ userId }: { userId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const seenRef = useRef(new Set<string>())

  useEffect(() => {
    const es = new EventSource('/api/notifications/stream')

    es.onmessage = (event) => {
      try {
        const { type, chat } = JSON.parse(event.data) as ChatEvent
        const key = `${type}-${chat.id}-${chat.status}`

        if (seenRef.current.has(key)) return
        seenRef.current.add(key)

        // Novo interesse recebido: INSERT pending onde sou o dono do serviço (participant_2)
        if (type === 'INSERT' && chat.status === 'pending' && chat.participant_2 === userId) {
          toast('Novo interesse em uma das suas trocas!', 'info')
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
      } catch {}
    }

    es.onerror = () => es.close()
    return () => es.close()
  }, [userId, toast, router])

  return null
}
