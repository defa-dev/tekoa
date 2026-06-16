'use client'

import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface UseAuthReturn {
  user: User | null
  session: Session | null
  loading: boolean
  error: Error | null
}

/**
 * Hook para acessar o usuário autenticado e sessão atual
 * 
 * @returns {UseAuthReturn} Objeto contendo user, session, loading e error
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, session, loading } = useAuth()
 *   
 *   if (loading) return <div>Carregando...</div>
 *   if (!user) return <div>Não autenticado</div>
 *   
 *   return <div>Olá, {user.email}</div>
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = 
          await supabase.auth.getSession()
        
        if (sessionError) throw sessionError

        setSession(initialSession)
        setUser(initialSession?.user ?? null)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, session, loading, error }
}
