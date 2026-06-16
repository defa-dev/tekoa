import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BaseService } from './base.service'
import type { ServiceResult } from './types'

// Mock do Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Classe concreta para testar a classe abstrata
class TestService extends BaseService<{ id: string; name: string; email: string }> {
  constructor() {
    super('test_table')
  }

  protected validate(data: any): ServiceResult<any> {
    if (!data.name || data.name.length < 3) {
      return {
        success: false,
        error: {
          message: 'Nome deve ter no mínimo 3 caracteres',
          code: 'VALIDATION_ERROR',
        },
      }
    }

    if (!data.email || !data.email.includes('@')) {
      return {
        success: false,
        error: {
          message: 'Email inválido',
          code: 'VALIDATION_ERROR',
        },
      }
    }

    return { success: true, data }
  }

  // Expor métodos protegidos para teste
  public async testList(filters?: any) {
    return this.list(filters)
  }

  public async testFindById(id: string) {
    return this.findById(id)
  }

  public async testCreate(data: any, options?: any) {
    return this.create(data, options)
  }

  public async testUpdate(id: string, data: any, options?: any) {
    return this.update(id, data, options)
  }

  public async testDelete(id: string, options?: any) {
    return this.delete(id, options)
  }

  public async testCount(filters?: any) {
    return this.count(filters)
  }

  public async testExists(id: string) {
    return this.exists(id)
  }
}

describe('BaseService', () => {
  let service: TestService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new TestService()
  })

  describe('list', () => {
    it('deve listar registros com sucesso', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockData = [
        { id: '1', name: 'Test 1', email: 'test1@example.com' },
        { id: '2', name: 'Test 2', email: 'test2@example.com' },
      ]

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: mockData,
            error: null,
            count: 2,
          }),
        }),
      } as any)

      const result = await service.testList()

      expect(result.success).toBe(true)
      expect(result.data?.data).toEqual(mockData)
      expect(result.data?.count).toBe(2)
      expect(result.data?.hasMore).toBe(false)
    })

    it('deve retornar erro ao falhar listagem', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error', code: 'DB_ERROR' },
            count: null,
          }),
        }),
      } as any)

      const result = await service.testList()

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('DB_ERROR')
    })
  })

  describe('findById', () => {
    it('deve buscar registro por ID', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockData = { id: '1', name: 'Test', email: 'test@example.com' }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockData,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.testFindById('1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
    })

    it('deve retornar erro NOT_FOUND quando registro não existe', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' },
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.testFindById('999')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('NOT_FOUND')
    })
  })

  describe('create', () => {
    it('deve criar registro com sucesso', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const newData = { name: 'New Test', email: 'new@example.com' }
      const createdData = { id: '3', ...newData }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: createdData,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.testCreate(newData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(createdData)
    })

    it('deve validar dados antes de criar', async () => {
      const invalidData = { name: 'ab', email: 'invalid' }

      const result = await service.testCreate(invalidData)

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('VALIDATION_ERROR')
    })

    it('deve permitir skip de validação', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const invalidData = { name: 'ab', email: 'invalid' }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: '1', ...invalidData },
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.testCreate(invalidData, { skipValidation: true })

      expect(result.success).toBe(true)
    })
  })

  describe('update', () => {
    it('deve atualizar registro com sucesso', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const updateData = { name: 'Updated', email: 'updated@example.com' }
      const updatedRecord = { id: '1', ...updateData }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: updatedRecord,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.testUpdate('1', updateData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(updatedRecord)
    })

    it('deve retornar NOT_FOUND ao atualizar registro inexistente', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const updateData = { name: 'Updated Name', email: 'valid@example.com' }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { code: 'PGRST116' },
                }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.testUpdate('999', updateData)

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('NOT_FOUND')
    })

    it('deve permitir atualização parcial sem validação completa', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const partialData = { name: 'New Name' }

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: '1', ...partialData, email: 'test@example.com' },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.testUpdate('1', partialData, { partial: true })

      expect(result.success).toBe(true)
    })
  })

  describe('delete', () => {
    it('deve deletar registro (hard delete)', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: null,
            }),
          }),
        }),
      } as any)

      const result = await service.testDelete('1')

      expect(result.success).toBe(true)
    })

    it('deve fazer soft delete quando especificado', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: null,
            }),
          }),
        }),
      } as any)

      const result = await service.testDelete('1', { soft: true })

      expect(result.success).toBe(true)
    })

    it('deve retornar erro ao falhar deleção', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: { message: 'Cannot delete', code: 'DELETE_ERROR' },
            }),
          }),
        }),
      } as any)

      const result = await service.testDelete('1')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('DELETE_ERROR')
    })
  })

  describe('count', () => {
    it('deve contar registros', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            count: 10,
            error: null,
          }),
        }),
      } as any)

      const result = await service.testCount()

      expect(result.success).toBe(true)
      expect(result.data).toBe(10)
    })

    it('deve contar com filtros', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockEq = vi.fn().mockResolvedValue({
        count: 5,
        error: null,
      })

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: mockEq,
          }),
        }),
      } as any)

      const result = await service.testCount({ name: 'Test' })

      expect(result.success).toBe(true)
      expect(result.data).toBe(5)
    })
  })

  describe('exists', () => {
    it('deve retornar true quando registro existe', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: '1' },
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.testExists('1')

      expect(result.success).toBe(true)
      expect(result.data).toBe(true)
    })

    it('deve retornar false quando registro não existe', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' },
              }),
            }),
          }),
        }),
      } as any)

      const result = await service.testExists('999')

      expect(result.success).toBe(true)
      expect(result.data).toBe(false)
    })
  })
})
