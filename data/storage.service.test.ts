import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StorageService, getStorageService } from './storage.service'

// Mock do Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('StorageService', () => {
  let service: StorageService

  // Mock de um arquivo de imagem válido
  const createMockFile = (size: number = 1024, type: string = 'image/jpeg'): File => {
    const blob = new Blob(['a'.repeat(size)], { type })
    return new File([blob], 'test.jpg', { type })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    service = new StorageService()
  })

  describe('validateFile', () => {
    it('deve rejeitar arquivo muito grande', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      // Mock básico (não será chamado pois validação falha antes)
      vi.mocked(createClient).mockResolvedValue({
        storage: {
          from: vi.fn().mockReturnValue({
            upload: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        },
      } as any)

      const largeFile = createMockFile(6 * 1024 * 1024) // 6MB

      const result = await service.uploadFile({
        bucket: 'avatars',
        path: 'test.jpg',
        file: largeFile,
      })

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('FILE_TOO_LARGE')
    })

    it('deve rejeitar tipo de arquivo inválido', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        storage: {
          from: vi.fn().mockReturnValue({
            upload: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        },
      } as any)

      const invalidFile = createMockFile(1024, 'application/pdf')

      const result = await service.uploadFile({
        bucket: 'avatars',
        path: 'test.pdf',
        file: invalidFile,
      })

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('INVALID_FILE_TYPE')
    })
  })

  describe('uploadFile', () => {
    it('deve fazer upload de arquivo válido', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockData = {
        path: 'user-123/avatar.jpg',
        fullPath: 'avatars/user-123/avatar.jpg',
      }

      vi.mocked(createClient).mockResolvedValue({
        storage: {
          from: vi.fn().mockReturnValue({
            upload: vi.fn().mockResolvedValue({
              data: mockData,
              error: null,
            }),
            getPublicUrl: vi.fn().mockReturnValue({
              data: { publicUrl: 'https://example.com/avatars/user-123/avatar.jpg' },
            }),
          }),
        },
      } as any)

      const file = createMockFile()

      const result = await service.uploadFile({
        bucket: 'avatars',
        path: 'user-123/avatar.jpg',
        file,
      })

      expect(result.success).toBe(true)
      expect(result.data?.path).toBe(mockData.path)
      expect(result.data?.publicUrl).toContain('https://example.com')
    })

    it('deve lidar com erro de upload', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        storage: {
          from: vi.fn().mockReturnValue({
            upload: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Upload failed' },
            }),
          }),
        },
      } as any)

      const file = createMockFile()

      const result = await service.uploadFile({
        bucket: 'avatars',
        path: 'test.jpg',
        file,
      })

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('UPLOAD_ERROR')
    })
  })

  describe('uploadAvatar', () => {
    it('deve fazer upload de avatar', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockData = {
        path: 'user-123/avatar.jpg',
        fullPath: 'avatars/user-123/avatar.jpg',
      }

      vi.mocked(createClient).mockResolvedValue({
        storage: {
          from: vi.fn().mockReturnValue({
            upload: vi.fn().mockResolvedValue({
              data: mockData,
              error: null,
            }),
            getPublicUrl: vi.fn().mockReturnValue({
              data: { publicUrl: 'https://example.com/avatars/user-123/avatar.jpg' },
            }),
          }),
        },
      } as any)

      const file = createMockFile()
      const result = await service.uploadAvatar('user-123', file)

      expect(result.success).toBe(true)
      expect(result.data?.bucket).toBe('avatars')
    })
  })

  describe('uploadProductImage', () => {
    it('deve fazer upload de imagem de produto', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockData = {
        path: 'user-123/product-456/image.jpg',
        fullPath: 'products/user-123/product-456/image.jpg',
      }

      vi.mocked(createClient).mockResolvedValue({
        storage: {
          from: vi.fn().mockReturnValue({
            upload: vi.fn().mockResolvedValue({
              data: mockData,
              error: null,
            }),
            getPublicUrl: vi.fn().mockReturnValue({
              data: { publicUrl: 'https://example.com/products/user-123/product-456/image.jpg' },
            }),
          }),
        },
      } as any)

      const file = createMockFile()
      const result = await service.uploadProductImage('user-123', 'product-456', file)

      expect(result.success).toBe(true)
      expect(result.data?.bucket).toBe('products')
    })
  })

  describe('uploadPostImage', () => {
    it('deve fazer upload de imagem de post', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockData = {
        path: 'user-123/post-789/image.jpg',
        fullPath: 'posts/user-123/post-789/image.jpg',
      }

      vi.mocked(createClient).mockResolvedValue({
        storage: {
          from: vi.fn().mockReturnValue({
            upload: vi.fn().mockResolvedValue({
              data: mockData,
              error: null,
            }),
            getPublicUrl: vi.fn().mockReturnValue({
              data: { publicUrl: 'https://example.com/posts/user-123/post-789/image.jpg' },
            }),
          }),
        },
      } as any)

      const file = createMockFile()
      const result = await service.uploadPostImage('user-123', 'post-789', file)

      expect(result.success).toBe(true)
      expect(result.data?.bucket).toBe('posts')
    })
  })

  describe('uploadServiceImage', () => {
    it('deve fazer upload de imagem de serviço', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockData = {
        path: 'user-123/service-101/image.jpg',
        fullPath: 'services/user-123/service-101/image.jpg',
      }

      vi.mocked(createClient).mockResolvedValue({
        storage: {
          from: vi.fn().mockReturnValue({
            upload: vi.fn().mockResolvedValue({
              data: mockData,
              error: null,
            }),
            getPublicUrl: vi.fn().mockReturnValue({
              data: { publicUrl: 'https://example.com/services/user-123/service-101/image.jpg' },
            }),
          }),
        },
      } as any)

      const file = createMockFile()
      const result = await service.uploadServiceImage('user-123', 'service-101', file)

      expect(result.success).toBe(true)
      expect(result.data?.bucket).toBe('services')
    })
  })

  describe('uploadMultipleFiles', () => {
    it('deve fazer upload de múltiplos arquivos', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        storage: {
          from: vi.fn().mockReturnValue({
            upload: vi.fn().mockResolvedValue({
              data: { path: 'test.jpg', fullPath: 'bucket/test.jpg' },
              error: null,
            }),
            getPublicUrl: vi.fn().mockReturnValue({
              data: { publicUrl: 'https://example.com/test.jpg' },
            }),
          }),
        },
      } as any)

      const file1 = createMockFile()
      const file2 = createMockFile()

      const result = await service.uploadMultipleFiles([
        { bucket: 'products', path: 'file1.jpg', file: file1 },
        { bucket: 'products', path: 'file2.jpg', file: file2 },
      ])

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
    })

    it('deve retornar erro se algum upload falhar', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      let callCount = 0
      vi.mocked(createClient).mockResolvedValue({
        storage: {
          from: vi.fn().mockReturnValue({
            upload: vi.fn().mockImplementation(() => {
              callCount++
              if (callCount === 1) {
                return Promise.resolve({
                  data: { path: 'test1.jpg', fullPath: 'bucket/test1.jpg' },
                  error: null,
                })
              }
              return Promise.resolve({
                data: null,
                error: { message: 'Upload failed' },
              })
            }),
            getPublicUrl: vi.fn().mockReturnValue({
              data: { publicUrl: 'https://example.com/test.jpg' },
            }),
          }),
        },
      } as any)

      const file1 = createMockFile()
      const file2 = createMockFile()

      const result = await service.uploadMultipleFiles([
        { bucket: 'products', path: 'file1.jpg', file: file1 },
        { bucket: 'products', path: 'file2.jpg', file: file2 },
      ])

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('MULTIPLE_UPLOAD_ERROR')
    })
  })

  describe('deleteFile', () => {
    it('deve deletar arquivo', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        storage: {
          from: vi.fn().mockReturnValue({
            remove: vi.fn().mockResolvedValue({ error: null }),
          }),
        },
      } as any)

      const result = await service.deleteFile('avatars', 'user-123/avatar.jpg')

      expect(result.success).toBe(true)
    })

    it('deve retornar erro ao deletar', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        storage: {
          from: vi.fn().mockReturnValue({
            remove: vi.fn().mockResolvedValue({
              error: { message: 'Delete failed' },
            }),
          }),
        },
      } as any)

      const result = await service.deleteFile('avatars', 'test.jpg')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('DELETE_ERROR')
    })
  })

  describe('deleteMultipleFiles', () => {
    it('deve deletar múltiplos arquivos', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        storage: {
          from: vi.fn().mockReturnValue({
            remove: vi.fn().mockResolvedValue({ error: null }),
          }),
        },
      } as any)

      const result = await service.deleteMultipleFiles('products', [
        'file1.jpg',
        'file2.jpg',
      ])

      expect(result.success).toBe(true)
    })
  })

  describe('getPublicUrl', () => {
    it('deve obter URL pública', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        storage: {
          from: vi.fn().mockReturnValue({
            getPublicUrl: vi.fn().mockReturnValue({
              data: { publicUrl: 'https://example.com/test.jpg' },
            }),
          }),
        },
      } as any)

      const result = await service.getPublicUrl('avatars', 'user-123/avatar.jpg')

      expect(result.success).toBe(true)
      expect(result.data).toBe('https://example.com/test.jpg')
    })
  })

  describe('listFiles', () => {
    it('deve listar arquivos', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockFiles = [
        { name: 'file1.jpg', id: '1' },
        { name: 'file2.jpg', id: '2' },
      ]

      vi.mocked(createClient).mockResolvedValue({
        storage: {
          from: vi.fn().mockReturnValue({
            list: vi.fn().mockResolvedValue({
              data: mockFiles,
              error: null,
            }),
          }),
        },
      } as any)

      const result = await service.listFiles('avatars', 'user-123')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockFiles)
    })
  })

  describe('replaceAvatar', () => {
    it('deve substituir avatar antigo', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      const mockData = {
        path: 'user-123/new-avatar.jpg',
        fullPath: 'avatars/user-123/new-avatar.jpg',
      }

      vi.mocked(createClient).mockResolvedValue({
        storage: {
          from: vi.fn().mockReturnValue({
            remove: vi.fn().mockResolvedValue({ error: null }),
            upload: vi.fn().mockResolvedValue({
              data: mockData,
              error: null,
            }),
            getPublicUrl: vi.fn().mockReturnValue({
              data: { publicUrl: 'https://example.com/avatars/user-123/new-avatar.jpg' },
            }),
          }),
        },
      } as any)

      const file = createMockFile()
      const oldUrl = 'https://example.com/avatars/user-123/old-avatar.jpg'

      const result = await service.replaceAvatar('user-123', file, oldUrl)

      expect(result.success).toBe(true)
      expect(result.data?.path).toBe(mockData.path)
    })
  })

  describe('moveFile', () => {
    it('deve mover arquivo', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        storage: {
          from: vi.fn().mockReturnValue({
            move: vi.fn().mockResolvedValue({ error: null }),
          }),
        },
      } as any)

      const result = await service.moveFile(
        'products',
        'old-path/file.jpg',
        'new-path/file.jpg'
      )

      expect(result.success).toBe(true)
    })
  })

  describe('getStorageService singleton', () => {
    it('deve retornar mesma instância', () => {
      const instance1 = getStorageService()
      const instance2 = getStorageService()

      expect(instance1).toBe(instance2)
    })
  })
})
