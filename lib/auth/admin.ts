import { getCurrentProfile } from './session'

/**
 * Confere se o usuário atual é admin da plataforma (`users.is_admin`).
 * Extraído de `app/admin/actions.ts` pra ser reusado por outras actions
 * administrativas (ex.: atribuir admin de comunidade).
 */
export async function ensureAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile()
  return !!profile?.is_admin
}
