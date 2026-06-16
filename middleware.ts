import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import {
  isPublicRoute,
  isAuthRoute,
  isAuthApiRoute,
  DEFAULT_LOGIN_REDIRECT,
  DEFAULT_AUTH_REDIRECT,
} from '@/lib/auth/routes'

/**
 * Middleware de autenticação do Next.js
 * 
 * Protege rotas privadas e gerencia redirecionamentos baseados em autenticação
 * 
 * @param request - Requisição do Next.js
 * @returns Response com redirecionamento ou continuação
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Atualizar sessão do Supabase
  const { response, user } = await updateSession(request)

  // 2. API routes de autenticação sempre permitidas
  if (isAuthApiRoute(pathname)) {
    return response
  }

  // 3. Rotas públicas sempre permitidas
  if (isPublicRoute(pathname)) {
    return response
  }

  // 4. Usuário autenticado tentando acessar rotas de auth (login/signup)
  // Redirecionar para dashboard
  if (user && isAuthRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = DEFAULT_LOGIN_REDIRECT
    return NextResponse.redirect(redirectUrl)
  }

  // 5. Usuário não autenticado tentando acessar rota privada
  // Redirecionar para login com callback
  if (!user && !isAuthRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = DEFAULT_AUTH_REDIRECT
    // Adicionar parâmetro de redirect para voltar após login
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 6. Permitir acesso
  return response
}

/**
 * Configuração do matcher do middleware
 * 
 * Define quais rotas o middleware deve processar
 * Exclui: _next/static, _next/image, favicon.ico, arquivos públicos
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
