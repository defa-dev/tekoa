import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signUp, signIn, signOut, resetPassword, updatePassword } from './actions'
import type { User, Session } from '@supabase/supabase-js'

// Mock do módulo next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn((path: string) => {
    throw new Error('NEXT_REDIRECT')
  }),
}))

// Mock do módulo next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock do Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('Auth Actions', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  } as User

  const mockSession: Session = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser,
  } as Session

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signUp', () => {
    it('deve criar um novo usuário com sucesso', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          signUp: vi.fn().mockResolvedValue({
            data: { user: mockUser, session: mockSession },
            error: null,
          }),
        },
      } as any)

      const result = await signUp('test@example.com', 'password123', { name: 'Test User' })

      expect(result.success).toBe(true)
      expect(result.data?.user).toEqual(mockUser)
      expect(result.data?.session).toEqual(mockSession)
      expect(result.error).toBeUndefined()
    })

    it('deve retornar erro para email inválido', async () => {
      const result = await signUp('invalid-email', 'password123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email inválido')
    })

    it('deve retornar erro para senha curta', async () => {
      const result = await signUp('test@example.com', '12345')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Senha deve ter no mínimo 6 caracteres')
    })

    it('deve retornar erro do Supabase quando falhar', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          signUp: vi.fn().mockResolvedValue({
            data: { user: null, session: null },
            error: { message: 'Email já cadastrado' },
          }),
        },
      } as any)

      const result = await signUp('test@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email já cadastrado')
    })

    it('deve tratar exceções inesperadas', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      
      vi.mocked(createClient).mockRejectedValue(new Error('Network error'))

      const result = await signUp('test@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('signIn', () => {
    it('deve fazer login com sucesso', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { user: mockUser, session: mockSession },
            error: null,
          }),
        },
      } as any)

      const result = await signIn('test@example.com', 'password123')

      expect(result.success).toBe(true)
      expect(result.data?.user).toEqual(mockUser)
      expect(result.data?.session).toEqual(mockSession)
    })

    it('deve retornar erro para email inválido', async () => {
      const result = await signIn('invalid-email', 'password123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email inválido')
    })

    it('deve retornar erro para senha vazia', async () => {
      const result = await signIn('test@example.com', '')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Senha é obrigatória')
    })

    it('deve retornar erro genérico para credenciais incorretas', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { user: null, session: null },
            error: { message: 'Invalid credentials' },
          }),
        },
      } as any)

      const result = await signIn('test@example.com', 'wrongpassword')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email ou senha incorretos')
    })
  })

  describe('signOut', () => {
    it('deve fazer logout com sucesso', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          signOut: vi.fn().mockResolvedValue({
            error: null,
          }),
        },
      } as any)

      // signOut deve redirecionar, então esperamos uma exceção
      await expect(signOut()).rejects.toThrow('NEXT_REDIRECT')
    })

    it('deve retornar erro quando o logout falhar', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          signOut: vi.fn().mockResolvedValue({
            error: { message: 'Logout failed' },
          }),
        },
      } as any)

      const result = await signOut()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Logout failed')
    })
  })

  describe('resetPassword', () => {
    it('deve enviar email de recuperação com sucesso', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          resetPasswordForEmail: vi.fn().mockResolvedValue({
            error: null,
          }),
        },
      } as any)

      const result = await resetPassword('test@example.com')

      expect(result.success).toBe(true)
      expect(result.data?.message).toBe('Email de recuperação enviado')
    })

    it('deve retornar erro para email inválido', async () => {
      const result = await resetPassword('invalid-email')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email inválido')
    })

    it('deve retornar erro do Supabase quando falhar', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          resetPasswordForEmail: vi.fn().mockResolvedValue({
            error: { message: 'Email not found' },
          }),
        },
      } as any)

      const result = await resetPassword('test@example.com')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email not found')
    })
  })

  describe('updatePassword', () => {
    it('deve atualizar senha com sucesso', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          updateUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      } as any)

      const result = await updatePassword('newpassword123')

      expect(result.success).toBe(true)
      expect(result.data?.user).toEqual(mockUser)
    })

    it('deve retornar erro para senha curta', async () => {
      const result = await updatePassword('12345')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Senha deve ter no mínimo 6 caracteres')
    })

    it('deve retornar erro do Supabase quando falhar', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          updateUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' },
          }),
        },
      } as any)

      const result = await updatePassword('newpassword123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Not authenticated')
    })

    it('deve tratar exceções inesperadas', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      
      vi.mocked(createClient).mockRejectedValue(new Error('Database error'))

      const result = await updatePassword('newpassword123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })
  })
})
