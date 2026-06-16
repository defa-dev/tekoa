import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MuralService, getMuralService } from './mural.service'
import type { Database } from '@/types/database.types'

type MuralPost = Database['public']['Tables']['mural_posts']['Row']

// Mock do Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('MuralService', () => {
  let service: MuralService

  const mockPost: MuralPost = {
    id: 'post-123',
    user_id: 'user-123',
    title: 'Evento Comunitário',
    content: 'Venha participar do nosso evento de trocas no sábado!',
    images: ['https://example.com/image1.jpg'],
    type: 'event',
    community: null,
    reach: 'all',
    reach_communities: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    service = new MuralService()
  })

  describe('validate', () => {
    it('deve validar título mínimo', async () => {
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
        title: 'ab',
        user_id: 'user-123',
      } as any)

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('INVALID_TITLE')
    })

    it('deve validar conteúdo mínimo', async () => {
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
        title: 'Post Teste',
        content: 'curto',
        user_id: 'user-123',
      } as any)

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('INVALID_CONTENT')
    })

    it('deve validar tipo válido', async () => {
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
        title: 'Post Teste',
        content: 'Conteúdo válido do post',
        type: 'invalid' as any,
        user_id: 'user-123',
      } as any)

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('INVALID_TYPE')
    })
  })

  describe('createPost', () => {
    it('deve criar post com sucesso', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockPost,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.createPost('user-123', {
        title: 'Evento Comunitário',
        content: 'Venha participar do nosso evento de trocas no sábado!',
        type: 'event',
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockPost)
    })
  })

  describe('getPosts', () => {
    it('deve listar posts', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockChain = {
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({
          data: [mockPost],
          error: null,
          count: 1,
        })),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue(mockChain),
        }),
      } as any)

      const result = await service.getPosts()

      expect(result.success).toBe(true)
      expect(result.data?.data).toHaveLength(1)
    })
  })

  describe('getPostById', () => {
    it('deve buscar post por ID', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockPost,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.getPostById('post-123')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockPost)
    })
  })

  describe('updatePost', () => {
    it('deve atualizar post do usuário', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const updatedPost = { ...mockPost, title: 'Título Atualizado' }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockPost,
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: updatedPost,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.updatePost('post-123', 'user-123', {
        title: 'Título Atualizado',
      })

      expect(result.success).toBe(true)
      expect(result.data?.title).toBe('Título Atualizado')
    })

    it('deve rejeitar atualização de post de outro usuário', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockPost,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.updatePost('post-123', 'other-user', {
        title: 'Título Atualizado',
      })

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('FORBIDDEN')
    })
  })

  describe('deletePost', () => {
    it('deve deletar post do usuário', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockPost,
                error: null,
              }),
            }),
          }),
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: null,
            }),
          }),
        }),
      } as any)

      const result = await service.deletePost('post-123', 'user-123')

      expect(result.success).toBe(true)
    })

    it('deve rejeitar deleção de post de outro usuário', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockPost,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.deletePost('post-123', 'other-user')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('FORBIDDEN')
    })
  })

  describe('uploadPostImages', () => {
    it('deve fazer upload de imagens', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockFile = new File(['test'], 'post.jpg', { type: 'image/jpeg' })

      vi.mocked(createClient).mockResolvedValue({
        storage: {
          from: vi.fn().mockReturnValue({
            upload: vi.fn().mockResolvedValue({
              error: null,
            }),
            getPublicUrl: vi.fn().mockReturnValue({
              data: { publicUrl: 'https://example.com/post.jpg' },
            }),
          }),
        },
      } as any)

      const result = await service.uploadPostImages('post-123', [mockFile])

      expect(result.success).toBe(true)
      expect(result.data).toEqual(['https://example.com/post.jpg'])
    })

    it('deve rejeitar mais de 3 imagens', async () => {
      const files = Array(4).fill(new File(['test'], 'image.jpg', { type: 'image/jpeg' }))

      const result = await service.uploadPostImages('post-123', files)

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('TOO_MANY_FILES')
    })

    it('deve rejeitar arquivo não-imagem', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockFile = new File(['test'], 'document.pdf', { type: 'application/pdf' })

      vi.mocked(createClient).mockResolvedValue({} as any)

      const result = await service.uploadPostImages('post-123', [mockFile])

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('INVALID_FILE_TYPE')
    })
  })

  describe('getByType', () => {
    it('deve buscar posts por tipo', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [mockPost],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.getByType('event')

      expect(result.success).toBe(true)
      expect(result.data).toEqual([mockPost])
    })
  })

  describe('getUserPosts', () => {
    it('deve buscar posts do usuário', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [mockPost],
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.getUserPosts('user-123')

      expect(result.success).toBe(true)
      expect(result.data).toEqual([mockPost])
    })
  })

  describe('getRecentPosts', () => {
    it('deve buscar posts recentes', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [mockPost],
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.getRecentPosts()

      expect(result.success).toBe(true)
      expect(result.data).toEqual([mockPost])
    })
  })

  describe('searchPosts', () => {
    it('deve buscar posts por query', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            or: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [mockPost],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.searchPosts('evento')

      expect(result.success).toBe(true)
      expect(result.data).toEqual([mockPost])
    })

    it('deve rejeitar query muito curta', async () => {
      const result = await service.searchPosts('a')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('INVALID_QUERY')
    })
  })

  describe('getAnnouncements', () => {
    it('deve buscar anúncios', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const announcement = { ...mockPost, type: 'announcement' as const }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [announcement],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.getAnnouncements()

      expect(result.success).toBe(true)
    })
  })

  describe('getEvents', () => {
    it('deve buscar eventos', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [mockPost],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.getEvents()

      expect(result.success).toBe(true)
      expect(result.data).toEqual([mockPost])
    })
  })

  describe('getMuralService singleton', () => {
    it('deve retornar mesma instância', () => {
      const instance1 = getMuralService()
      const instance2 = getMuralService()

      expect(instance1).toBe(instance2)
    })
  })
})
