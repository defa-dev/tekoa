import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductService, getProductService } from './product.service'
import type { Database } from '@/types/database.types'

type Product = Database['public']['Tables']['products']['Row']

// Mock do Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('ProductService', () => {
  let service: ProductService

  const mockProduct: Product = {
    id: 'product-123',
    user_id: 'user-123',
    title: 'Bicicleta Caloi',
    description: 'Bicicleta em bom estado, pouco uso',
    price: 500,
    category: 'Esportes',
    condition: 'good',
    images: ['https://example.com/image1.jpg'],
    status: 'available',
    location: 'São Paulo',
    community: null,
    reach: 'all',
    reach_communities: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ProductService()
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

    it('deve validar descrição mínima', async () => {
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
        title: 'Produto Teste',
        description: 'curto',
        user_id: 'user-123',
      } as any)

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('INVALID_DESCRIPTION')
    })

    it('deve validar preço negativo', async () => {
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
        title: 'Produto Teste',
        description: 'Descrição válida do produto',
        price: -10,
        user_id: 'user-123',
      } as any)

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('INVALID_PRICE')
    })
  })

  describe('createProduct', () => {
    it('deve criar produto com sucesso', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProduct,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.createProduct('user-123', {
        title: 'Bicicleta Caloi',
        description: 'Bicicleta em bom estado, pouco uso',
        price: 500,
        category: 'Esportes',
        condition: 'good',
        location: 'São Paulo',
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockProduct)
    })
  })

  describe('getProducts', () => {
    it('deve listar produtos com filtros', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockChain = {
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({
          data: [mockProduct],
          error: null,
          count: 1,
        })),
      }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue(mockChain),
        }),
      } as any)

      const result = await service.getProducts()

      expect(result.success).toBe(true)
      expect(result.data?.data).toHaveLength(1)
    })
  })

  describe('getProductById', () => {
    it('deve buscar produto por ID', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProduct,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.getProductById('product-123')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockProduct)
    })
  })

  describe('updateProduct', () => {
    it('deve atualizar produto do usuário', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const updatedProduct = { ...mockProduct, price: 450 }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProduct,
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: updatedProduct,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.updateProduct('product-123', 'user-123', {
        price: 450,
      })

      expect(result.success).toBe(true)
      expect(result.data?.price).toBe(450)
    })

    it('deve rejeitar atualização de produto de outro usuário', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProduct,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.updateProduct('product-123', 'other-user', {
        price: 450,
      })

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('FORBIDDEN')
    })
  })

  describe('updateStatus', () => {
    it('deve atualizar status do produto', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const soldProduct = { ...mockProduct, status: 'sold' as const }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProduct,
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: soldProduct,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.updateStatus('product-123', 'user-123', 'sold')

      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('sold')
    })
  })

  describe('deleteProduct', () => {
    it('deve deletar produto do usuário', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProduct,
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

      const result = await service.deleteProduct('product-123', 'user-123')

      expect(result.success).toBe(true)
    })

    it('deve rejeitar deleção de produto de outro usuário', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProduct,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.deleteProduct('product-123', 'other-user')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('FORBIDDEN')
    })
  })

  describe('uploadProductImages', () => {
    it('deve fazer upload de imagens', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockFile = new File(['test'], 'product.jpg', { type: 'image/jpeg' })

      vi.mocked(createClient).mockResolvedValue({
        storage: {
          from: vi.fn().mockReturnValue({
            upload: vi.fn().mockResolvedValue({
              error: null,
            }),
            getPublicUrl: vi.fn().mockReturnValue({
              data: { publicUrl: 'https://example.com/product.jpg' },
            }),
          }),
        },
      } as any)

      const result = await service.uploadProductImages('product-123', [mockFile])

      expect(result.success).toBe(true)
      expect(result.data).toEqual(['https://example.com/product.jpg'])
    })

    it('deve rejeitar mais de 5 imagens', async () => {
      const files = Array(6).fill(new File(['test'], 'image.jpg', { type: 'image/jpeg' }))

      const result = await service.uploadProductImages('product-123', files)

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('TOO_MANY_FILES')
    })

    it('deve rejeitar arquivo não-imagem', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockFile = new File(['test'], 'document.pdf', { type: 'application/pdf' })

      vi.mocked(createClient).mockResolvedValue({} as any)

      const result = await service.uploadProductImages('product-123', [mockFile])

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('INVALID_FILE_TYPE')
    })
  })

  describe('getByCategory', () => {
    it('deve buscar produtos por categoria', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: [mockProduct],
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.getByCategory('Esportes')

      expect(result.success).toBe(true)
      expect(result.data).toEqual([mockProduct])
    })
  })

  describe('getUserProducts', () => {
    it('deve buscar produtos do usuário', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: [mockProduct],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.getUserProducts('user-123')

      expect(result.success).toBe(true)
      expect(result.data).toEqual([mockProduct])
    })
  })

  describe('getSimilarProducts', () => {
    it('deve buscar produtos similares', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const anotherProduct = { ...mockProduct, id: 'product-456', title: 'Outra Bicicleta' }

      const mockClient = {
        from: vi.fn().mockImplementation(() => ({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProduct,
                error: null,
              }),
              eq: vi.fn().mockReturnValue({
                neq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({
                      data: [anotherProduct],
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        })),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as any)

      const result = await service.getSimilarProducts('product-123')

      expect(result.success).toBe(true)
      expect(result.data).toEqual([anotherProduct])
    })
  })

  describe('getProductService singleton', () => {
    it('deve retornar mesma instância', () => {
      const instance1 = getProductService()
      const instance2 = getProductService()

      expect(instance1).toBe(instance2)
    })
  })
})
