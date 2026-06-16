'use client'

import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface UseSessionReturn {
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  error: Error | null
}

/**
 * Hook simplificado para acessar apenas a sessão atual
 * 
 * @returns {UseSessionReturn} Objeto contendo session, loading, isAuthenticated e error
 * 
 * @example
 * ```tsx
 * function ProtectedComponent() {
 *   const { isAuthenticated, loading } = useSession()
 *   
 *   if (loading) return <div>Carregando...</div>
 *   if (!isAuthenticated) return <div>Acesso negado</div>
 *   
 *   return <div>Conteúdo protegido</div>
 * }
 * ```
 */
export function useSession(): UseSessionReturn {
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
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { 
    session, 
    loading, 
    isAuthenticated: session !== null,
    error 
  }
}
