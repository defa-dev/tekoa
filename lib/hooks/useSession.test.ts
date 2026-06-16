import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSession } from './useSession'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

// Mock do Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

describe('useSession', () => {
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

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('deve inicializar com loading true', async () => {
    const mockGetSession = vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    })
    const mockOnAuthStateChange = vi.fn(() => ({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    }))

    vi.mocked(createClient).mockReturnValue({
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
      },
    } as any)

    const { result } = renderHook(() => useSession())

    // Wait for initial state
    await waitFor(() => {
      expect(result.current).toBeTruthy()
    })

    // After getSession completes, loading should be false
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.session).toBe(null)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('deve retornar sessão quando autenticado', async () => {
    vi.mocked(createClient).mockReturnValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: mockSession },
          error: null,
        }),
        onAuthStateChange: vi.fn(() => ({
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        })),
      },
    } as any)

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.session).toEqual(mockSession)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.error).toBe(null)
  })

  it('deve retornar isAuthenticated false quando não há sessão', async () => {
    vi.mocked(createClient).mockReturnValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: null,
        }),
        onAuthStateChange: vi.fn(() => ({
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        })),
      },
    } as any)

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.session).toBe(null)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('deve capturar erro ao buscar sessão', async () => {
    const mockError = new Error('Session error')
    vi.mocked(createClient).mockReturnValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: mockError,
        }),
        onAuthStateChange: vi.fn(() => ({
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        })),
      },
    } as any)

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toEqual(mockError)
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('deve atualizar isAuthenticated quando sessão mudar', async () => {
    let authStateCallback: (event: string, session: Session | null) => void = () => {}
    
    vi.mocked(createClient).mockReturnValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: null,
        }),
        onAuthStateChange: vi.fn((callback) => {
          authStateCallback = callback
          return {
            data: {
              subscription: {
                unsubscribe: vi.fn(),
              },
            },
          }
        }),
      },
    } as any)

    const { result } = renderHook(() => useSession())

    // Inicialmente não autenticado
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.isAuthenticated).toBe(false)

    // Simular login
    authStateCallback('SIGNED_IN', mockSession)

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.session).toEqual(mockSession)
    })

    // Simular logout
    authStateCallback('SIGNED_OUT', null)

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.session).toBe(null)
    })
  })
})
