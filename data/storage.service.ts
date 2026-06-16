import { createClient as createServerClient } from '@/lib/supabase/server'
import type { ServiceResult } from './types'

/**
 * Tipos de bucket disponíveis no storage
 */
export type StorageBucket = 'avatars' | 'products' | 'posts' | 'services'

/**
 * Opções para upload de arquivo
 */
export interface UploadOptions {
  bucket: StorageBucket
  path: string
  file: File | Blob
  contentType?: string
  cacheControl?: string
  upsert?: boolean
}

/**
 * Informações do arquivo uploaded
 */
export interface UploadedFile {
  path: string
  fullPath: string
  publicUrl: string
  bucket: StorageBucket
}

/**
 * Service para gerenciar upload e download de arquivos no Supabase Storage
 * 
 * Responsável por:
 * - Upload de arquivos (avatares, imagens de produtos, posts)
 * - Geração de URLs públicas
 * - Deleção de arquivos
 * - Validação de tipos e tamanhos
 */
export class StorageService {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  private readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ]

  /**
   * Valida um arquivo antes do upload
   */
  private validateFile(file: File | Blob): ServiceResult<void> {
    // Validar tamanho
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        success: false,
        error: {
          message: `Arquivo muito grande. Tamanho máximo: ${
            this.MAX_FILE_SIZE / 1024 / 1024
          }MB`,
          code: 'FILE_TOO_LARGE',
        },
      }
    }

    // Validar tipo (apenas imagens)
    if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: {
          message: 'Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF',
          code: 'INVALID_FILE_TYPE',
        },
      }
    }

    return { success: true }
  }

  /**
   * Gera um nome único para o arquivo
   */
  private generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const extension = originalName.split('.').pop()
    return `${timestamp}-${random}.${extension}`
  }

  /**
   * Faz upload de um arquivo
   */
  public async uploadFile(options: UploadOptions): Promise<ServiceResult<UploadedFile>> {
    try {
      // Validar arquivo
      const validation = this.validateFile(options.file)
      if (!validation.success) {
        return validation as ServiceResult<UploadedFile>
      }

      const client = await createServerClient()

      // Fazer upload
      const { data, error } = await client.storage
        .from(options.bucket)
        .upload(options.path, options.file, {
          contentType: options.contentType || options.file.type,
          cacheControl: options.cacheControl || '3600',
          upsert: options.upsert || false,
        })

      if (error) {
        return {
          success: false,
          error: {
            message: error.message || 'Erro ao fazer upload do arquivo',
            code: 'UPLOAD_ERROR',
            details: error,
          },
        }
      }

      // Obter URL pública
      const {
        data: { publicUrl },
      } = client.storage.from(options.bucket).getPublicUrl(data.path)

      return {
        success: true,
        data: {
          path: data.path,
          fullPath: data.fullPath,
          publicUrl,
          bucket: options.bucket,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          code: 'UNKNOWN_ERROR',
          details: error,
        },
      }
    }
  }

  /**
   * Upload de avatar de usuário
   */
  public async uploadAvatar(
    userId: string,
    file: File | Blob
  ): Promise<ServiceResult<UploadedFile>> {
    const fileName = this.generateUniqueFileName(
      file instanceof File ? file.name : 'avatar.jpg'
    )
    const path = `${userId}/${fileName}`

    return this.uploadFile({
      bucket: 'avatars',
      path,
      file,
      upsert: true,
    })
  }

  /**
   * Upload de imagem de produto
   */
  public async uploadProductImage(
    userId: string,
    productId: string,
    file: File | Blob
  ): Promise<ServiceResult<UploadedFile>> {
    const fileName = this.generateUniqueFileName(
      file instanceof File ? file.name : 'product.jpg'
    )
    const path = `${userId}/${productId}/${fileName}`

    return this.uploadFile({
      bucket: 'products',
      path,
      file,
    })
  }

  /**
   * Upload de imagem de post do mural
   */
  public async uploadPostImage(
    userId: string,
    postId: string,
    file: File | Blob
  ): Promise<ServiceResult<UploadedFile>> {
    const fileName = this.generateUniqueFileName(
      file instanceof File ? file.name : 'post.jpg'
    )
    const path = `${userId}/${postId}/${fileName}`

    return this.uploadFile({
      bucket: 'posts',
      path,
      file,
    })
  }

  /**
   * Upload de imagem de serviço
   */
  public async uploadServiceImage(
    userId: string,
    serviceId: string,
    file: File | Blob
  ): Promise<ServiceResult<UploadedFile>> {
    const fileName = this.generateUniqueFileName(
      file instanceof File ? file.name : 'service.jpg'
    )
    const path = `${userId}/${serviceId}/${fileName}`

    return this.uploadFile({
      bucket: 'services',
      path,
      file,
    })
  }

  /**
   * Upload de múltiplos arquivos
   */
  public async uploadMultipleFiles(
    uploads: UploadOptions[]
  ): Promise<ServiceResult<UploadedFile[]>> {
    try {
      const results = await Promise.all(
        uploads.map((upload) => this.uploadFile(upload))
      )

      // Verificar se todos os uploads foram bem sucedidos
      const failures = results.filter((r) => !r.success)
      if (failures.length > 0) {
        return {
          success: false,
          error: {
            message: `${failures.length} arquivo(s) falharam no upload`,
            code: 'MULTIPLE_UPLOAD_ERROR',
            details: failures.map((f) => f.error),
          },
        }
      }

      return {
        success: true,
        data: results.map((r) => r.data!),
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          code: 'UNKNOWN_ERROR',
          details: error,
        },
      }
    }
  }

  /**
   * Deleta um arquivo
   */
  public async deleteFile(
    bucket: StorageBucket,
    path: string
  ): Promise<ServiceResult<void>> {
    try {
      const client = await createServerClient()

      const { error } = await client.storage.from(bucket).remove([path])

      if (error) {
        return {
          success: false,
          error: {
            message: error.message || 'Erro ao deletar arquivo',
            code: 'DELETE_ERROR',
            details: error,
          },
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          code: 'UNKNOWN_ERROR',
          details: error,
        },
      }
    }
  }

  /**
   * Deleta múltiplos arquivos
   */
  public async deleteMultipleFiles(
    bucket: StorageBucket,
    paths: string[]
  ): Promise<ServiceResult<void>> {
    try {
      const client = await createServerClient()

      const { error } = await client.storage.from(bucket).remove(paths)

      if (error) {
        return {
          success: false,
          error: {
            message: error.message || 'Erro ao deletar arquivos',
            code: 'DELETE_ERROR',
            details: error,
          },
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          code: 'UNKNOWN_ERROR',
          details: error,
        },
      }
    }
  }

  /**
   * Obtém URL pública de um arquivo
   */
  public async getPublicUrl(
    bucket: StorageBucket,
    path: string
  ): Promise<ServiceResult<string>> {
    try {
      const client = await createServerClient()

      const {
        data: { publicUrl },
      } = client.storage.from(bucket).getPublicUrl(path)

      return {
        success: true,
        data: publicUrl,
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          code: 'UNKNOWN_ERROR',
          details: error,
        },
      }
    }
  }

  /**
   * Lista arquivos em um bucket/path
   */
  public async listFiles(
    bucket: StorageBucket,
    path?: string
  ): Promise<ServiceResult<any[]>> {
    try {
      const client = await createServerClient()

      const { data, error } = await client.storage.from(bucket).list(path)

      if (error) {
        return {
          success: false,
          error: {
            message: error.message || 'Erro ao listar arquivos',
            code: 'LIST_ERROR',
            details: error,
          },
        }
      }

      return {
        success: true,
        data: data || [],
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          code: 'UNKNOWN_ERROR',
          details: error,
        },
      }
    }
  }

  /**
   * Deleta avatar antigo e faz upload do novo
   */
  public async replaceAvatar(
    userId: string,
    newFile: File | Blob,
    oldAvatarUrl?: string
  ): Promise<ServiceResult<UploadedFile>> {
    // Se existe avatar antigo, tentar deletar
    if (oldAvatarUrl) {
      try {
        // Extrair o path do avatar antigo da URL
        const urlParts = oldAvatarUrl.split('/avatars/')
        if (urlParts.length > 1) {
          const oldPath = urlParts[1].split('?')[0] // Remove query params
          await this.deleteFile('avatars', oldPath)
        }
      } catch {
        // Ignorar erro ao deletar avatar antigo
      }
    }

    // Fazer upload do novo avatar
    return this.uploadAvatar(userId, newFile)
  }

  /**
   * Move um arquivo de um path para outro
   */
  public async moveFile(
    bucket: StorageBucket,
    fromPath: string,
    toPath: string
  ): Promise<ServiceResult<void>> {
    try {
      const client = await createServerClient()

      const { error } = await client.storage
        .from(bucket)
        .move(fromPath, toPath)

      if (error) {
        return {
          success: false,
          error: {
            message: error.message || 'Erro ao mover arquivo',
            code: 'MOVE_ERROR',
            details: error,
          },
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          code: 'UNKNOWN_ERROR',
          details: error,
        },
      }
    }
  }
}

// Singleton instance
let storageServiceInstance: StorageService | null = null

/**
 * Obtém instância singleton do StorageService
 */
export function getStorageService(): StorageService {
  if (!storageServiceInstance) {
    storageServiceInstance = new StorageService()
  }
  return storageServiceInstance
}
