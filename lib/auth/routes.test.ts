import { describe, it, expect } from 'vitest'
import {
  publicRoutes,
  authRoutes,
  authApiPrefix,
  DEFAULT_LOGIN_REDIRECT,
  DEFAULT_AUTH_REDIRECT,
  isPublicRoute,
  isAuthRoute,
  isAuthApiRoute,
} from './routes'

describe('routes configuration', () => {
  describe('constants', () => {
    it('deve ter rotas públicas definidas', () => {
      expect(publicRoutes).toBeDefined()
      expect(publicRoutes).toContain('/')
      expect(publicRoutes.length).toBeGreaterThan(0)
    })

    it('deve ter rotas de autenticação definidas', () => {
      expect(authRoutes).toBeDefined()
      expect(authRoutes).toContain('/login')
      expect(authRoutes).toContain('/signup')
      expect(authRoutes.length).toBeGreaterThan(0)
    })

    it('deve ter prefixo de API de auth definido', () => {
      expect(authApiPrefix).toBe('/api/auth')
    })

    it('deve ter redirect padrão de login', () => {
      expect(DEFAULT_LOGIN_REDIRECT).toBe('/dashboard')
    })

    it('deve ter redirect padrão de auth', () => {
      expect(DEFAULT_AUTH_REDIRECT).toBe('/login')
    })
  })

  describe('isPublicRoute', () => {
    it('deve retornar true para rota raiz', () => {
      expect(isPublicRoute('/')).toBe(true)
    })

    it('deve retornar true para rotas públicas definidas', () => {
      expect(isPublicRoute('/about')).toBe(true)
      expect(isPublicRoute('/contact')).toBe(true)
    })

    it('deve retornar false para rotas não públicas', () => {
      expect(isPublicRoute('/dashboard')).toBe(false)
      expect(isPublicRoute('/perfil')).toBe(false)
      expect(isPublicRoute('/servicos')).toBe(false)
    })

    it('deve retornar false para rotas de autenticação', () => {
      expect(isPublicRoute('/login')).toBe(false)
      expect(isPublicRoute('/signup')).toBe(false)
    })
  })

  describe('isAuthRoute', () => {
    it('deve retornar true para rotas de login', () => {
      expect(isAuthRoute('/login')).toBe(true)
    })

    it('deve retornar true para rotas de signup', () => {
      expect(isAuthRoute('/signup')).toBe(true)
    })

    it('deve retornar true para rotas de reset password', () => {
      expect(isAuthRoute('/reset-password')).toBe(true)
      expect(isAuthRoute('/update-password')).toBe(true)
    })

    it('deve retornar false para rotas não de autenticação', () => {
      expect(isAuthRoute('/')).toBe(false)
      expect(isAuthRoute('/dashboard')).toBe(false)
      expect(isAuthRoute('/perfil')).toBe(false)
    })

    it('deve suportar rotas com query params', () => {
      expect(isAuthRoute('/login?redirect=/dashboard')).toBe(true)
      expect(isAuthRoute('/signup?from=home')).toBe(true)
    })
  })

  describe('isAuthApiRoute', () => {
    it('deve retornar true para rotas de API de auth', () => {
      expect(isAuthApiRoute('/api/auth/login')).toBe(true)
      expect(isAuthApiRoute('/api/auth/signup')).toBe(true)
      expect(isAuthApiRoute('/api/auth/callback')).toBe(true)
    })

    it('deve retornar false para outras rotas de API', () => {
      expect(isAuthApiRoute('/api/users')).toBe(false)
      expect(isAuthApiRoute('/api/services')).toBe(false)
    })

    it('deve retornar false para rotas não de API', () => {
      expect(isAuthApiRoute('/login')).toBe(false)
      expect(isAuthApiRoute('/dashboard')).toBe(false)
    })
  })
})
