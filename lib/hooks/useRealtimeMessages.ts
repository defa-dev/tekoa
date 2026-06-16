import { useEffect, useState, useCallback, useRef } from 'react'
import { getRealtimeClient } from '@/lib/realtime/client'
import type { MessagePayload } from '@/lib/realtime/types'
import type { Message } from '@/types'

/**
 * Opções para o hook useRealtimeMessages
 */
interface UseRealtimeMessagesOptions {
  chatId: string
  enabled?: boolean
  onInsert?: (message: Message) => void
  onUpdate?: (message: Message) => void
  onDelete?: (messageId: string) => void
}

/**
 * Hook para gerenciar mensagens em tempo real de um chat
 * 
 * Responsável por:
 * - Subscrever a mudanças na tabela messages
 * - Gerenciar lifecycle de subscrições
 * - Notificar componente sobre novos eventos
 * - Cleanup automático no unmount
 * 
 * @example
 * ```tsx
 * const { messages, isConnected } = useRealtimeMessages({
 *   chatId: 'chat-123',
 *   onInsert: (message) => {
 *     console.log('Nova mensagem:', message)
 *   }
 * })
 * ```
 */
export function useRealtimeMessages(options: UseRealtimeMessagesOptions) {
  const { chatId, enabled = true, onInsert, onUpdate, onDelete } = options

  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const channelIdRef = useRef<string | null>(null)
  const clientRef = useRef(getRealtimeClient())

  const handlePayload = useCallback(
    (payload: MessagePayload) => {
      try {
        const { eventType, new: newRecord, old: oldRecord } = payload

        switch (eventType) {
          case 'INSERT':
            if (newRecord && onInsert) {
              onInsert(newRecord as Message)
            }
            break

          case 'UPDATE':
            if (newRecord && onUpdate) {
              onUpdate(newRecord as Message)
            }
            break

          case 'DELETE':
            if (oldRecord?.id && onDelete) {
              onDelete(oldRecord.id)
            }
            break
        }
      } catch (err) {
        console.error('[useRealtimeMessages] Error handling payload:', err)
        setError(err as Error)
      }
    },
    [onInsert, onUpdate, onDelete]
  )

  useEffect(() => {
    if (!enabled || !chatId) {
      return
    }

    const client = clientRef.current
    let retryCount = 0
    const maxRetries = 3

    const attemptSubscribe = () => {
      try {
        // Subscrever ao chat
        const channelId = client.subscribeToChat(chatId, handlePayload)
        channelIdRef.current = channelId

        // Verificar conexão após um delay
        const checkTimeout = setTimeout(() => {
          const isActive = client.isChannelActive(channelId)
          setIsConnected(isActive)

          if (!isActive && retryCount < maxRetries) {
            retryCount++
            console.warn(`[useRealtimeMessages] Channel not ready, retrying (${retryCount}/${maxRetries})`)
            // Unsubscribe e tentar novamente
            client.unsubscribe(channelId).catch(() => {})
            setTimeout(attemptSubscribe, 1000 * retryCount) // backoff
          } else if (!isActive) {
            console.warn('[useRealtimeMessages] Failed to connect after retries')
            setError(new Error('Failed to connect to chat after retries'))
          }
        }, 1500)

        return checkTimeout
      } catch (err) {
        console.error('[useRealtimeMessages] Error subscribing:', err)
        setError(err as Error)
        return null
      }
    }

    const checkTimeout = attemptSubscribe()

    // Cleanup
    return () => {
      if (checkTimeout) clearTimeout(checkTimeout)
      if (channelIdRef.current) {
        client.unsubscribe(channelIdRef.current).catch((err) => {
          console.error('[useRealtimeMessages] Error unsubscribing:', err)
        })
        channelIdRef.current = null
      }
      setIsConnected(false)
      setError(null)
    }
  }, [chatId, enabled, handlePayload])

  return {
    isConnected,
    error,
  }
}

/**
 * Hook simplificado para apenas receber novas mensagens
 * 
 * @example
 * ```tsx
 * useRealtimeNewMessages('chat-123', (message) => {
 *   addMessageToList(message)
 * })
 * ```
 */
export function useRealtimeNewMessages(
  chatId: string,
  onNewMessage: (message: Message) => void,
  enabled = true
) {
  return useRealtimeMessages({
    chatId,
    enabled,
    onInsert: onNewMessage,
  })
}

/**
 * Hook para monitorar todos os eventos de mensagens
 * 
 * @example
 * ```tsx
 * const { isConnected } = useRealtimeMessageEvents('chat-123', {
 *   onNew: (msg) => console.log('New:', msg),
 *   onUpdate: (msg) => console.log('Updated:', msg),
 *   onDelete: (id) => console.log('Deleted:', id),
 * })
 * ```
 */
export function useRealtimeMessageEvents(
  chatId: string,
  callbacks: {
    onNew?: (message: Message) => void
    onUpdate?: (message: Message) => void
    onDelete?: (messageId: string) => void
  },
  enabled = true
) {
  return useRealtimeMessages({
    chatId,
    enabled,
    onInsert: callbacks.onNew,
    onUpdate: callbacks.onUpdate,
    onDelete: callbacks.onDelete,
  })
}
