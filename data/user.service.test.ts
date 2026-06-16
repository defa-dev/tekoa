import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserService, getUserService } from './user.service'
import type { Database } from '@/types/database.types'

type User = Database['public']['Tables']['users']['Row']

// Mock do Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('UserService', () => {
  let service: UserService

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    avatar_url: null,
    phone: null,
    location: 'São Paulo',
    bio: 'Test bio',
    rating: 4.5,
    total_ratings: 10,
    is_admin: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    service = new UserService()
  })

  describe('validate', () => {
    it('deve validar email corretamente', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      // Email inválido
      const invalidResult = await service['create']({ email: 'invalid' } as any)
      expect(invalidResult.success).toBe(false)
      expect(invalidResult.error?.code).toBe('INVALID_EMAIL')
    })

    it('deve validar nome mínimo', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service['create']({
        id: '123',
        email: 'test@example.com',
        full_name: 'A',
        total_ratings: 0,
      } as any)

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('INVALID_NAME')
    })

    it('deve validar telefone', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service['create']({
        id: '123',
        email: 'test@example.com',
        phone: 'abc123',
        total_ratings: 0,
      } as any)

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('INVALID_PHONE')
    })

    it('deve validar tamanho da bio', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service['create']({
        id: '123',
        email: 'test@example.com',
        bio: 'a'.repeat(501),
        total_ratings: 0,
      } as any)

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('BIO_TOO_LONG')
    })
  })

  describe('getCurrentUser', () => {
    it('deve retornar usuário autenticado', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123', email: 'test@example.com' } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockUser,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.getCurrentUser()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUser)
    })

    it('deve retornar erro se não autenticado', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' },
          }),
        },
      } as any)

      const result = await service.getCurrentUser()

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('NOT_AUTHENTICATED')
    })

    it('deve criar usuário se não existir na tabela', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123', email: 'test@example.com' } },
            error: null,
          }),
        },
        from: vi.fn().mockImplementation((table) => {
          if (table === 'users') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValueOnce({
                    data: null,
                    error: { code: 'PGRST116' },
                  }),
                }),
              }),
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockUser,
                    error: null,
                  }),
                }),
              }),
            }
          }
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as any)

      const result = await service.getCurrentUser()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUser)
    })
  })

  describe('getUserById', () => {
    it('deve buscar usuário por ID', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockUser,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.getUserById('user-123')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUser)
    })
  })

  describe('updateProfile', () => {
    it('deve atualizar perfil do usuário', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const updatedUser = { ...mockUser, full_name: 'Updated Name' }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: updatedUser,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.updateProfile('user-123', {
        fullName: 'Updated Name',
      })

      expect(result.success).toBe(true)
      expect(result.data?.full_name).toBe('Updated Name')
    })

    it('deve atualizar apenas campos fornecidos', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { ...mockUser, location: 'Rio de Janeiro' },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.updateProfile('user-123', {
        location: 'Rio de Janeiro',
      })

      expect(result.success).toBe(true)
      expect(result.data?.location).toBe('Rio de Janeiro')
    })
  })

  describe('updateAvatar', () => {
    it('deve atualizar avatar do usuário', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const updatedUser = { ...mockUser, avatar_url: 'https://example.com/avatar.jpg' }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: updatedUser,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.updateAvatar('user-123', 'https://example.com/avatar.jpg')

      expect(result.success).toBe(true)
      expect(result.data?.avatar_url).toBe('https://example.com/avatar.jpg')
    })
  })

  describe('uploadAvatar', () => {
    it('deve fazer upload de avatar', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockFile = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' })

      vi.mocked(createClient).mockResolvedValue({
        storage: {
          from: vi.fn().mockReturnValue({
            upload: vi.fn().mockResolvedValue({
              error: null,
            }),
            getPublicUrl: vi.fn().mockReturnValue({
              data: { publicUrl: 'https://example.com/avatar.jpg' },
            }),
          }),
        },
      } as any)

      const result = await service.uploadAvatar('user-123', mockFile)

      expect(result.success).toBe(true)
      expect(result.data?.url).toBe('https://example.com/avatar.jpg')
    })

    it('deve rejeitar arquivo não-imagem', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockFile = new File(['test'], 'document.pdf', { type: 'application/pdf' })

      vi.mocked(createClient).mockResolvedValue({} as any)

      const result = await service.uploadAvatar('user-123', mockFile)

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('INVALID_FILE_TYPE')
    })

    it('deve rejeitar arquivo muito grande', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      // Criar arquivo fake de 6MB
      const largeData = new Uint8Array(6 * 1024 * 1024)
      const mockFile = new File([largeData], 'large.jpg', { type: 'image/jpeg' })

      vi.mocked(createClient).mockResolvedValue({} as any)

      const result = await service.uploadAvatar('user-123', mockFile)

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('FILE_TOO_LARGE')
    })
  })

  describe('searchByName', () => {
    it('deve buscar usuários por nome', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [mockUser],
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.searchByName('Test')

      expect(result.success).toBe(true)
      expect(result.data).toEqual([mockUser])
    })

    it('deve rejeitar query muito curta', async () => {
      const result = await service.searchByName('a')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('INVALID_QUERY')
    })
  })

  describe('findByLocation', () => {
    it('deve buscar usuários por localização', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [mockUser],
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.findByLocation('São Paulo')

      expect(result.success).toBe(true)
      expect(result.data).toEqual([mockUser])
    })
  })

  describe('getTopRated', () => {
    it('deve retornar usuários com melhor avaliação', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            not: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: [mockUser],
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.getTopRated()

      expect(result.success).toBe(true)
      expect(result.data).toEqual([mockUser])
    })
  })

  describe('updateRating', () => {
    it('deve atualizar rating do usuário', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const updatedUser = { ...mockUser, rating: 4.8, total_ratings: 11 }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: updatedUser,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.updateRating('user-123', 4.8, 11)

      expect(result.success).toBe(true)
      expect(result.data?.rating).toBe(4.8)
      expect(result.data?.total_ratings).toBe(11)
    })

    it('deve rejeitar rating inválido', async () => {
      const result = await service.updateRating('user-123', 6, 10)

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('INVALID_RATING')
    })
  })

  describe('getUserService singleton', () => {
    it('deve retornar mesma instância', () => {
      const instance1 = getUserService()
      const instance2 = getUserService()

      expect(instance1).toBe(instance2)
    })
  })
})
