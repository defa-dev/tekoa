/**
 * Configuração de rotas públicas e privadas
 * 
 * Define quais rotas são acessíveis sem autenticação e quais requerem login
 */

/**
 * Rotas públicas - acessíveis sem autenticação
 */
export const publicRoutes = [
  '/',
  '/about',
  '/contact',
]

/**
 * Rotas de autenticação - redirecionam para /dashboard se já autenticado
 */
export const authRoutes = [
  '/login',
  '/signup',
  '/reset-password',
  '/update-password',
]

/**
 * Prefixo de rotas de API de autenticação - sempre públicas
 */
export const authApiPrefix = '/api/auth'

/**
 * Rota padrão para redirecionar após login
 */
export const DEFAULT_LOGIN_REDIRECT = '/dashboard'

/**
 * Rota padrão para redirecionar quando não autenticado
 */
export const DEFAULT_AUTH_REDIRECT = '/login'

/**
 * Verifica se uma rota é pública
 */
export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === pathname) return true
    // Suporta rotas dinâmicas como /blog/[slug]
    if (route.includes('[') && pathname.startsWith(route.split('[')[0])) {
      return true
    }
    return false
  })
}

/**
 * Verifica se uma rota é de autenticação
 */
export function isAuthRoute(pathname: string): boolean {
  return authRoutes.some(route => pathname.startsWith(route))
}

/**
 * Verifica se uma rota é de API de autenticação
 */
export function isAuthApiRoute(pathname: string): boolean {
  return pathname.startsWith(authApiPrefix)
}
