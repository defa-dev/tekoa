import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase com a chave de serviço (service role).
 *
 * SÓ no servidor — bypassa RLS. Usar apenas em operações já autorizadas no
 * nível da aplicação (ex.: após checar is_admin numa Server Action).
 *
 * Tipagem solta (sem generic Database) seguindo o padrão dos services, que
 * fazem cast manual das linhas — evita o ruído de `never` no insert/update.
 */
export function createAdminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
