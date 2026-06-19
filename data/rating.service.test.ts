import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RatingService, getRatingService } from './rating.service'
import type { Database } from '@/types/database.types'

type Rating = Database['public']['Tables']['ratings']['Row']

// Mock do Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('RatingService', () => {
  let service: RatingService

  const mockRating: Rating = {
    id: 'rating-123',
    from_user_id: 'user-1',
    to_user_id: 'user-2',
    service_id: 'service-123',
    product_id: null,
    rating: 5,
    comment: 'Excelente serviço!',
    created_at: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    service = new RatingService()
  })

  describe('validate', () => {
    it('deve validar rating inválido (menor que 1)', async () => {
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
        from_user_id: 'user-1',
        to_user_id: 'user-2',
        rating: 0,
      } as any)

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('INVALID_RATING')
    })

    it('deve validar rating inválido (maior que 5)', async () => {
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
        from_user_id: 'user-1',
        to_user_id: 'user-2',
        rating: 6,
      } as any)

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('INVALID_RATING')
    })

    it('deve validar auto-avaliação', async () => {
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
        from_user_id: 'user-1',
        to_user_id: 'user-1',
        rating: 5,
      } as any)

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('SELF_RATING')
    })
  })

  describe('createRating', () => {
    it('deve criar avaliação', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockClient = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'ratings') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({
                      data: [],
                      error: null,
                    }),
                  }),
                }),
              }),
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockRating,
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === 'users') {
            return {
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  error: null,
                }),
              }),
            }
          }
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as any)

      const result = await service.createRating('user-1', {
        to_user_id: 'user-2',
        rating: 5,
        comment: 'Excelente serviço!',
        service_id: 'service-123',
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockRating)
    })

    it('deve rejeitar avaliação duplicada', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [{ id: 'existing' }],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.createRating('user-1', {
        to_user_id: 'user-2',
        rating: 5,
        service_id: 'service-123',
      })

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('ALREADY_RATED')
    })

    it('deve criar avaliação de negociação de produto', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const productRating = { ...mockRating, service_id: null, product_id: 'prod-123' }

      const mockClient = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'ratings') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                  }),
                }),
              }),
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: productRating, error: null }),
                }),
              }),
            }
          }
          if (table === 'users') {
            return { update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) }
          }
        }),
      }
      vi.mocked(createClient).mockResolvedValue(mockClient as any)

      const result = await service.createRating('user-1', {
        to_user_id: 'user-2',
        rating: 4,
        product_id: 'prod-123',
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(productRating)
    })

    it('deve rejeitar avaliação duplicada de produto', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [{ id: 'existing' }], error: null }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.createRating('user-1', {
        to_user_id: 'user-2',
        rating: 4,
        product_id: 'prod-123',
      })

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('ALREADY_RATED')
    })
  })

  describe('getUserRatings', () => {
    it('deve buscar avaliações do usuário', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({
                  data: [mockRating],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.getUserRatings('user-2')

      expect(result.success).toBe(true)
      expect(result.data).toEqual([mockRating])
    })
  })

  describe('getRatingsByUser', () => {
    it('deve buscar avaliações feitas pelo usuário', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({
                  data: [mockRating],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.getRatingsByUser('user-1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual([mockRating])
    })
  })

  describe('getRatingById', () => {
    it('deve buscar avaliação por ID', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockRating,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.getRatingById('rating-123')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockRating)
    })
  })

  describe('updateRating', () => {
    it('deve atualizar avaliação do usuário', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const updatedRating = { ...mockRating, rating: 4 }

      const mockClient = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'ratings') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockRating,
                    error: null,
                  }),
                  order: vi.fn().mockReturnValue({
                    range: vi.fn().mockResolvedValue({
                      data: [mockRating],
                      error: null,
                    }),
                  }),
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: updatedRating,
                      error: null,
                    }),
                  }),
                }),
              }),
            }
          }
          if (table === 'users') {
            return {
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  error: null,
                }),
              }),
            }
          }
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as any)

      const result = await service.updateRating('rating-123', 'user-1', {
        rating: 4,
      })

      expect(result.success).toBe(true)
      expect(result.data?.rating).toBe(4)
    })

    it('deve rejeitar atualização de avaliação de outro usuário', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockRating,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.updateRating('rating-123', 'other-user', {
        rating: 4,
      })

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('FORBIDDEN')
    })
  })

  describe('deleteRating', () => {
    it('deve deletar avaliação do usuário', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockClient = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'ratings') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockRating,
                    error: null,
                  }),
                  order: vi.fn().mockReturnValue({
                    range: vi.fn().mockResolvedValue({
                      data: [],
                      error: null,
                    }),
                  }),
                }),
              }),
              delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  error: null,
                }),
              }),
            }
          }
          if (table === 'users') {
            return {
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  error: null,
                }),
              }),
            }
          }
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as any)

      const result = await service.deleteRating('rating-123', 'user-1')

      expect(result.success).toBe(true)
    })

    it('deve rejeitar deleção de avaliação de outro usuário', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockRating,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.deleteRating('rating-123', 'other-user')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('FORBIDDEN')
    })
  })

  describe('getUserRatingStats', () => {
    it('deve calcular estatísticas de avaliação', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [
                { rating: 5 },
                { rating: 5 },
                { rating: 4 },
                { rating: 3 },
              ],
              error: null,
            }),
          }),
        }),
      } as any)

      const result = await service.getUserRatingStats('user-2')

      expect(result.success).toBe(true)
      expect(result.data?.totalRatings).toBe(4)
      expect(result.data?.averageRating).toBe(4.3)
      expect(result.data?.ratings[5]).toBe(2)
      expect(result.data?.ratings[4]).toBe(1)
      expect(result.data?.ratings[3]).toBe(1)
    })

    it('deve retornar estatísticas vazias se não houver avaliações', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      } as any)

      const result = await service.getUserRatingStats('user-2')

      expect(result.success).toBe(true)
      expect(result.data?.totalRatings).toBe(0)
      expect(result.data?.averageRating).toBe(0)
    })
  })

  describe('getServiceRatings', () => {
    it('deve buscar avaliações de um serviço', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [mockRating],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.getServiceRatings('service-123')

      expect(result.success).toBe(true)
      expect(result.data).toEqual([mockRating])
    })
  })

  describe('getRecentRatings', () => {
    it('deve buscar avaliações recentes', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [mockRating],
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.getRecentRatings()

      expect(result.success).toBe(true)
      expect(result.data).toEqual([mockRating])
    })
  })

  describe('getRatingService singleton', () => {
    it('deve retornar mesma instância', () => {
      const instance1 = getRatingService()
      const instance2 = getRatingService()

      expect(instance1).toBe(instance2)
    })
  })
})
