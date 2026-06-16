import { createClient } from '@/lib/supabase/server'
import type { User } from '@/types'

/**
 * Helpers de sessão para Server Components.
 *
 * Encapsulam o acesso ao usuário autenticado e ao seu perfil, lendo do
 * cliente Supabase de servidor (cookies → respeita RLS).
 */

/**
 * Retorna o usuário de autenticação atual (ou null).
 */
export async function getAuthUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Retorna o perfil completo (linha em public.users) do usuário atual, ou null.
 */
export async function getCurrentProfile(): Promise<User | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (data as User | null) ?? null
}
