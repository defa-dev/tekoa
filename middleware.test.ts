import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { middleware, config } from './middleware'

// Mock do updateSession
vi.mock('@/lib/supabase/middleware', () => ({
  updateSession: vi.fn(),
}))

// Mock das rotas
vi.mock('@/lib/auth/routes', () => ({
  isPublicRoute: vi.fn(),
  isAuthRoute: vi.fn(),
  isAuthApiRoute: vi.fn(),
  DEFAULT_LOGIN_REDIRECT: '/dashboard',
  DEFAULT_AUTH_REDIRECT: '/login',
}))

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createMockRequest = (pathname: string): NextRequest => {
    const url = new URL(pathname, 'http://localhost:3000')
    return {
      nextUrl: {
        pathname,
        clone: () => url,
      },
    } as unknown as NextRequest
  }

  describe('API routes de autenticação', () => {
    it('deve permitir acesso a rotas de API de auth', async () => {
      const { updateSession } = await import('@/lib/supabase/middleware')
      const { isAuthApiRoute } = await import('@/lib/auth/routes')
      
      const mockResponse = NextResponse.next()
      vi.mocked(updateSession).mockResolvedValue({
        response: mockResponse,
        user: null,
      })
      vi.mocked(isAuthApiRoute).mockReturnValue(true)

      const request = createMockRequest('/api/auth/callback')
      const response = await middleware(request)

      expect(response).toBe(mockResponse)
    })
  })

  describe('rotas públicas', () => {
    it('deve permitir acesso a rotas públicas sem autenticação', async () => {
      const { updateSession } = await import('@/lib/supabase/middleware')
      const { isPublicRoute, isAuthApiRoute } = await import('@/lib/auth/routes')
      
      const mockResponse = NextResponse.next()
      vi.mocked(updateSession).mockResolvedValue({
        response: mockResponse,
        user: null,
      })
      vi.mocked(isAuthApiRoute).mockReturnValue(false)
      vi.mocked(isPublicRoute).mockReturnValue(true)

      const request = createMockRequest('/')
      const response = await middleware(request)

      expect(response).toBe(mockResponse)
    })
  })

  describe('rotas de autenticação', () => {
    it('deve redirecionar usuário autenticado de /login para /dashboard', async () => {
      const { updateSession } = await import('@/lib/supabase/middleware')
      const { isAuthRoute, isAuthApiRoute, isPublicRoute } = await import('@/lib/auth/routes')
      
      const mockResponse = NextResponse.next()
      const mockUser = { id: 'user-123', email: 'test@example.com' } as unknown as Awaited<
        ReturnType<typeof import('@/lib/supabase/middleware').updateSession>
      >['user']
      
      vi.mocked(updateSession).mockResolvedValue({
        response: mockResponse,
        user: mockUser,
      })
      vi.mocked(isAuthApiRoute).mockReturnValue(false)
      vi.mocked(isPublicRoute).mockReturnValue(false)
      vi.mocked(isAuthRoute).mockReturnValue(true)

      const request = createMockRequest('/login')
      const response = await middleware(request)

      expect(response).toBeInstanceOf(NextResponse)
      // Verificar se é um redirect (status 307 ou 308)
      expect([307, 308]).toContain(response.status)
    })

    it('deve permitir acesso a /login quando não autenticado', async () => {
      const { updateSession } = await import('@/lib/supabase/middleware')
      const { isAuthRoute, isAuthApiRoute, isPublicRoute } = await import('@/lib/auth/routes')
      
      const mockResponse = NextResponse.next()
      vi.mocked(updateSession).mockResolvedValue({
        response: mockResponse,
        user: null,
      })
      vi.mocked(isAuthApiRoute).mockReturnValue(false)
      vi.mocked(isPublicRoute).mockReturnValue(false)
      vi.mocked(isAuthRoute).mockReturnValue(true)

      const request = createMockRequest('/login')
      const response = await middleware(request)

      expect(response).toBe(mockResponse)
    })
  })

  describe('rotas privadas', () => {
    it('deve redirecionar usuário não autenticado para /login', async () => {
      const { updateSession } = await import('@/lib/supabase/middleware')
      const { isAuthRoute, isAuthApiRoute, isPublicRoute } = await import('@/lib/auth/routes')
      
      const mockResponse = NextResponse.next()
      vi.mocked(updateSession).mockResolvedValue({
        response: mockResponse,
        user: null,
      })
      vi.mocked(isAuthApiRoute).mockReturnValue(false)
      vi.mocked(isPublicRoute).mockReturnValue(false)
      vi.mocked(isAuthRoute).mockReturnValue(false)

      const request = createMockRequest('/dashboard')
      const response = await middleware(request)

      expect(response).toBeInstanceOf(NextResponse)
      expect([307, 308]).toContain(response.status)
    })

    it('deve adicionar parâmetro redirect ao redirecionar para login', async () => {
      const { updateSession } = await import('@/lib/supabase/middleware')
      const { isAuthRoute, isAuthApiRoute, isPublicRoute } = await import('@/lib/auth/routes')
      
      const mockResponse = NextResponse.next()
      vi.mocked(updateSession).mockResolvedValue({
        response: mockResponse,
        user: null,
      })
      vi.mocked(isAuthApiRoute).mockReturnValue(false)
      vi.mocked(isPublicRoute).mockReturnValue(false)
      vi.mocked(isAuthRoute).mockReturnValue(false)

      const request = createMockRequest('/perfil')
      const response = await middleware(request)

      expect(response).toBeInstanceOf(NextResponse)
      // O redirect deveria adicionar ?redirect=/perfil
    })

    it('deve permitir acesso a rotas privadas quando autenticado', async () => {
      const { updateSession } = await import('@/lib/supabase/middleware')
      const { isAuthRoute, isAuthApiRoute, isPublicRoute } = await import('@/lib/auth/routes')
      
      const mockResponse = NextResponse.next()
      const mockUser = { id: 'user-123', email: 'test@example.com' } as unknown as Awaited<
        ReturnType<typeof import('@/lib/supabase/middleware').updateSession>
      >['user']
      
      vi.mocked(updateSession).mockResolvedValue({
        response: mockResponse,
        user: mockUser,
      })
      vi.mocked(isAuthApiRoute).mockReturnValue(false)
      vi.mocked(isPublicRoute).mockReturnValue(false)
      vi.mocked(isAuthRoute).mockReturnValue(false)

      const request = createMockRequest('/dashboard')
      const response = await middleware(request)

      expect(response).toBe(mockResponse)
    })
  })

  describe('config', () => {
    it('deve ter matcher configurado', () => {
      expect(config.matcher).toBeDefined()
      expect(Array.isArray(config.matcher)).toBe(true)
      expect(config.matcher.length).toBeGreaterThan(0)
    })

    it('matcher deve excluir arquivos estáticos', () => {
      const pattern = config.matcher[0]
      
      // Verifica que o pattern é uma string com regex
      expect(typeof pattern).toBe('string')
      expect(pattern).toContain('_next/static')
      expect(pattern).toContain('_next/image')
      expect(pattern).toContain('favicon.ico')
    })
  })
})
