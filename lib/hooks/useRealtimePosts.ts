import { useEffect, useState, useCallback, useRef } from 'react'
import { getRealtimeClient } from '@/lib/realtime/client'
import type { MuralPostPayload } from '@/lib/realtime/types'
import type { MuralPost } from '@/types'

/**
 * Opções para o hook useRealtimePosts
 */
interface UseRealtimePostsOptions {
  enabled?: boolean
  onInsert?: (post: MuralPost) => void
  onUpdate?: (post: MuralPost) => void
  onDelete?: (postId: string) => void
}

/**
 * Hook para gerenciar posts do mural em tempo real
 * 
 * Responsável por:
 * - Subscrever a mudanças na tabela mural_posts
 * - Gerenciar lifecycle de subscrições
 * - Notificar componente sobre novos eventos
 * - Cleanup automático no unmount
 * 
 * @example
 * ```tsx
 * const { isConnected } = useRealtimePosts({
 *   onInsert: (post) => {
 *     console.log('Novo post:', post)
 *     addPostToFeed(post)
 *   }
 * })
 * ```
 */
export function useRealtimePosts(options: UseRealtimePostsOptions = {}) {
  const { enabled = true, onInsert, onUpdate, onDelete } = options

  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const channelIdRef = useRef<string | null>(null)
  const clientRef = useRef(getRealtimeClient())

  const handlePayload = useCallback(
    (payload: MuralPostPayload) => {
      try {
        const { eventType, new: newRecord, old: oldRecord } = payload

        switch (eventType) {
          case 'INSERT':
            if (newRecord && onInsert) {
              onInsert(newRecord as MuralPost)
            }
            break

          case 'UPDATE':
            if (newRecord && onUpdate) {
              onUpdate(newRecord as MuralPost)
            }
            break

          case 'DELETE':
            if (oldRecord?.id && onDelete) {
              onDelete(oldRecord.id)
            }
            break
        }
      } catch (err) {
        console.error('[useRealtimePosts] Error handling payload:', err)
        setError(err as Error)
      }
    },
    [onInsert, onUpdate, onDelete]
  )

  useEffect(() => {
    if (!enabled) {
      return
    }

    const client = clientRef.current

    try {
      // Subscrever aos posts do mural
      const channelId = client.subscribeToMuralPosts(handlePayload)
      channelIdRef.current = channelId

      // Verificar conexão após um delay
      setTimeout(() => {
        const isActive = client.isChannelActive(channelId)
        setIsConnected(isActive)

        if (!isActive) {
          setError(new Error('Failed to connect to mural posts'))
        }
      }, 1000)
    } catch (err) {
      console.error('[useRealtimePosts] Error subscribing:', err)
      setError(err as Error)
    }

    // Cleanup
    return () => {
      if (channelIdRef.current) {
        client.unsubscribe(channelIdRef.current).catch((err) => {
          console.error('[useRealtimePosts] Error unsubscribing:', err)
        })
        channelIdRef.current = null
      }
      setIsConnected(false)
      setError(null)
    }
  }, [enabled, handlePayload])

  return {
    isConnected,
    error,
  }
}

/**
 * Hook simplificado para apenas receber novos posts
 * 
 * @example
 * ```tsx
 * useRealtimeNewPosts((post) => {
 *   prependPostToFeed(post)
 *   showNotification(`Novo post de ${post.author_name}`)
 * })
 * ```
 */
export function useRealtimeNewPosts(
  onNewPost: (post: MuralPost) => void,
  enabled = true
) {
  return useRealtimePosts({
    enabled,
    onInsert: onNewPost,
  })
}

/**
 * Hook para monitorar todos os eventos de posts
 * 
 * @example
 * ```tsx
 * const { isConnected } = useRealtimePostEvents({
 *   onNew: (post) => addToFeed(post),
 *   onUpdate: (post) => updateInFeed(post),
 *   onDelete: (id) => removeFromFeed(id),
 * })
 * ```
 */
export function useRealtimePostEvents(
  callbacks: {
    onNew?: (post: MuralPost) => void
    onUpdate?: (post: MuralPost) => void
    onDelete?: (postId: string) => void
  },
  enabled = true
) {
  return useRealtimePosts({
    enabled,
    onInsert: callbacks.onNew,
    onUpdate: callbacks.onUpdate,
    onDelete: callbacks.onDelete,
  })
}

/**
 * Hook para monitorar atualizações em posts (likes, comments, etc)
 * 
 * @example
 * ```tsx
 * useRealtimePostUpdates((post) => {
 *   updatePostInState(post)
 * })
 * ```
 */
export function useRealtimePostUpdates(
  onUpdate: (post: MuralPost) => void,
  enabled = true
) {
  return useRealtimePosts({
    enabled,
    onUpdate,
  })
}
