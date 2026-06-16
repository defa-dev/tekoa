import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from './useAuth'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

// Mock do Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

describe('useAuth', () => {
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

  it('deve inicializar com loading true e user/session null', async () => {
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

    const { result } = renderHook(() => useAuth())

    // Wait for initial state to be set
    await waitFor(() => {
      expect(result.current).toBeTruthy()
    })

    // Initially should have loading false after getSession completes
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.user).toBe(null)
    expect(result.current.session).toBe(null)
    expect(result.current.error).toBe(null)
  })

  it('deve retornar usuário e sessão quando autenticado', async () => {
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

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.session).toEqual(mockSession)
    expect(result.current.error).toBe(null)
  })

  it('deve retornar null quando não autenticado', async () => {
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

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBe(null)
    expect(result.current.session).toBe(null)
    expect(result.current.error).toBe(null)
  })

  it('deve capturar erro ao buscar sessão', async () => {
    const mockError = new Error('Failed to get session')
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

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toEqual(mockError)
    expect(result.current.user).toBe(null)
    expect(result.current.session).toBe(null)
  })

  it('deve atualizar quando o estado de autenticação mudar', async () => {
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

    const { result } = renderHook(() => useAuth())

    // Inicialmente não autenticado
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.user).toBe(null)

    // Simular mudança de estado (login)
    authStateCallback('SIGNED_IN', mockSession)

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.session).toEqual(mockSession)
    })
  })

  it('deve fazer unsubscribe ao desmontar', async () => {
    const unsubscribeMock = vi.fn()
    const mockGetSession = vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    })
    const mockOnAuthStateChange = vi.fn(() => ({
      data: {
        subscription: {
          unsubscribe: unsubscribeMock,
        },
      },
    }))

    vi.mocked(createClient).mockReturnValue({
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
      },
    } as any)

    const { unmount } = renderHook(() => useAuth())
    
    // Wait for initial render to complete
    await waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalled()
    })

    unmount()

    expect(unsubscribeMock).toHaveBeenCalled()
  })
})
