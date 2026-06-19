import { BaseService } from './base.service'
import { territoryOrFilter } from '@/lib/territories'
import { getTekoinService } from './tekoin.service'
import type { ServiceResult, BaseFilters, PaginatedResult } from './types'
import type { Database } from '@/types/database.types'

// `accepts_tekoins` ainda não está no tipo gerado (migration 013 não rodou /
// types não regenerados) — intersection até `database.types.ts` ser atualizado.
type Product = Database['public']['Tables']['products']['Row'] & { accepts_tekoins: boolean }
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

/**
 * Filtros específicos para produtos
 */
export interface ProductFilters extends BaseFilters {
  category?: string
  condition?: Product['condition']
  status?: Product['status']
  minPrice?: number
  maxPrice?: number
  location?: string
  userId?: string
  searchQuery?: string
  viewerCommunity?: string | null
  allTerritories?: boolean
}

/**
 * Dados para criação de produto
 */
export interface CreateProductData {
  title: string
  description: string
  price: number
  category: string
  condition: Product['condition']
  images?: string[]
  location?: string | null
  community?: string | null
  reach?: string
  reach_communities?: string[]
  accepts_tekoins?: boolean
}

/** Autor resumido anexado a um produto. */
export interface ProductAuthor {
  id: string
  full_name: string | null
  location: string | null
  avatar_url: string | null
}

/** Produto com o autor embutido (via join). */
export interface ProductWithUser extends Product {
  user: ProductAuthor | null
}

/**
 * Service para gerenciar produtos da Feira do Rolo
 * 
 * Responsável por:
 * - CRUD de produtos
 * - Filtros e busca de produtos
 * - Upload de imagens
 * - Gerenciamento de status (available, reserved, sold)
 */
export class ProductService extends BaseService<Product> {
  constructor() {
    super('products')
  }

  /**
   * Valida dados do produto
   */
  protected validate(data: Partial<Product>): ServiceResult<Product> {
    // Título é obrigatório e deve ter no mínimo 3 caracteres
    if (data.title !== undefined) {
      if (!data.title || data.title.trim().length < 3) {
        return {
          success: false,
          error: {
            message: 'Título deve ter no mínimo 3 caracteres',
            code: 'INVALID_TITLE',
          },
        }
      }

      if (data.title.length > 100) {
        return {
          success: false,
          error: {
            message: 'Título não pode exceder 100 caracteres',
            code: 'TITLE_TOO_LONG',
          },
        }
      }
    }

    // Descrição é obrigatória e deve ter no mínimo 10 caracteres
    if (data.description !== undefined) {
      if (!data.description || data.description.trim().length < 10) {
        return {
          success: false,
          error: {
            message: 'Descrição deve ter no mínimo 10 caracteres',
            code: 'INVALID_DESCRIPTION',
          },
        }
      }

      if (data.description.length > 1000) {
        return {
          success: false,
          error: {
            message: 'Descrição não pode exceder 1000 caracteres',
            code: 'DESCRIPTION_TOO_LONG',
          },
        }
      }
    }

    // Preço deve ser positivo
    if (data.price !== undefined && data.price < 0) {
      return {
        success: false,
        error: {
          message: 'Preço deve ser maior ou igual a zero',
          code: 'INVALID_PRICE',
        },
      }
    }

    // Categoria é obrigatória
    if (data.category !== undefined && (!data.category || data.category.trim().length === 0)) {
      return {
        success: false,
        error: {
          message: 'Categoria é obrigatória',
          code: 'INVALID_CATEGORY',
        },
      }
    }

    // Validar condição
    const validConditions: Product['condition'][] = ['new', 'like_new', 'good', 'fair']
    if (data.condition !== undefined && !validConditions.includes(data.condition)) {
      return {
        success: false,
        error: {
          message: 'Condição inválida',
          code: 'INVALID_CONDITION',
        },
      }
    }

    // Validar status
    const validStatuses: Product['status'][] = ['available', 'reserved', 'sold']
    if (data.status !== undefined && !validStatuses.includes(data.status)) {
      return {
        success: false,
        error: {
          message: 'Status inválido',
          code: 'INVALID_STATUS',
        },
      }
    }

    // Validar array de imagens
    if (data.images !== undefined && !Array.isArray(data.images)) {
      return {
        success: false,
        error: {
          message: 'Imagens deve ser um array',
          code: 'INVALID_IMAGES',
        },
      }
    }

    return { success: true, data: data as Product }
  }

  /**
   * Cria um novo produto
   */
  public async createProduct(
    userId: string,
    productData: CreateProductData
  ): Promise<ServiceResult<Product>> {
    try {
      // `accepts_tekoins` ainda não está em ProductInsert (gerado antes da
      // migration 013) — cast explícito até `database.types.ts` ser regenerado.
      const insertData = {
        user_id: userId,
        title: productData.title,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        condition: productData.condition,
        images: productData.images || [],
        location: productData.location,
        status: 'available',
        community: productData.community ?? null,
        reach: productData.reach ?? 'own',
        reach_communities: productData.reach_communities ?? [],
        accepts_tekoins: productData.accepts_tekoins ?? false,
      } as ProductInsert

      return this.create(insertData)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Lista produtos com filtros
   */
  public async getProducts(
    filters?: ProductFilters
  ): Promise<ServiceResult<PaginatedResult<Product>>> {
    try {
      const client = await this.ensureClient()

      let query = client
        .from(this.tableName as any)
        .select('*', { count: 'exact' })

      // Aplicar filtros
      if (filters?.category) {
        query = query.eq('category', filters.category)
      }

      if (filters?.condition) {
        query = query.eq('condition', filters.condition)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      } else {
        // Por padrão, mostrar apenas disponíveis
        query = query.eq('status', 'available')
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice)
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice)
      }

      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId)
      }

      if (filters?.searchQuery) {
        query = query.or(
          `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
        )
      }

      // Aplicar ordenação
      if (filters?.orderBy) {
        query = query.order(filters.orderBy, {
          ascending: filters.orderDirection === 'asc',
        })
      } else {
        // Ordenação padrão: mais recentes primeiro
        query = query.order('created_at', { ascending: false })
      }

      // Aplicar paginação
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }
      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1
        )
      }

      const { data, error, count } = await query

      if (error) {
        return this.handleError(error)
      }

      return {
        success: true,
        data: {
          data: (data || []) as Product[],
          count: count || 0,
          hasMore: filters?.limit
            ? (filters.offset || 0) + (filters.limit || 0) < (count || 0)
            : false,
          offset: filters?.offset || 0,
        },
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Busca produto por ID
   */
  public async getProductById(id: string): Promise<ServiceResult<Product>> {
    return this.findById(id)
  }

  /**
   * Lista produtos com o autor embutido (join com users), numa só query.
   */
  public async getProductsWithUser(
    filters?: ProductFilters
  ): Promise<ServiceResult<ProductWithUser[]>> {
    try {
      const client = await this.ensureClient()

      let query = client
        .from(this.tableName as any)
        .select('*, user:users(id, full_name, location, avatar_url)')

      query = query.eq('status', filters?.status ?? 'available')
      if (filters?.category) query = query.eq('category', filters.category)
      if (filters?.userId) query = query.eq('user_id', filters.userId)
      if (filters?.searchQuery) {
        query = query.or(
          `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
        )
      }
      if (filters?.viewerCommunity && !filters?.allTerritories) {
        query = query.or(territoryOrFilter(filters.viewerCommunity))
      }

      query = query.order('created_at', { ascending: false })
      if (filters?.limit) query = query.limit(filters.limit)

      const { data, error } = await query
      if (error) return this.handleError(error)

      const products = (data || []) as unknown as ProductWithUser[]
      return { success: true, data: await getTekoinService().sortByActiveBoost(products, 'product_id') }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Busca um produto por id já com o autor embutido.
   */
  public async getProductByIdWithUser(
    id: string
  ): Promise<ServiceResult<ProductWithUser>> {
    try {
      const client = await this.ensureClient()
      const { data, error } = await client
        .from(this.tableName as any)
        .select('*, user:users(id, full_name, location, avatar_url)')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: this.createError('Produto não encontrado', 'NOT_FOUND') }
        }
        return this.handleError(error)
      }
      return { success: true, data: data as unknown as ProductWithUser }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Atualiza um produto
   */
  public async updateProduct(
    id: string,
    userId: string,
    updates: Partial<CreateProductData>
  ): Promise<ServiceResult<Product>> {
    try {
      // Verificar se o produto pertence ao usuário
      const productResult = await this.findById(id)
      if (!productResult.success) {
        return productResult
      }

      if (productResult.data!.user_id !== userId) {
        return {
          success: false,
          error: {
            message: 'Você não tem permissão para editar este produto',
            code: 'FORBIDDEN',
          },
        }
      }

      const updateData: Partial<Product> = {
        ...updates,
        updated_at: new Date().toISOString(),
      }

      return this.update(id, updateData, { partial: true })
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Atualiza o status de um produto
   */
  public async updateStatus(
    id: string,
    userId: string,
    status: Product['status']
  ): Promise<ServiceResult<Product>> {
    try {
      // Verificar se o produto pertence ao usuário
      const productResult = await this.findById(id)
      if (!productResult.success) {
        return productResult
      }

      if (productResult.data!.user_id !== userId) {
        return {
          success: false,
          error: {
            message: 'Você não tem permissão para alterar este produto',
            code: 'FORBIDDEN',
          },
        }
      }

      const updateData: Partial<Product> = {
        status,
        updated_at: new Date().toISOString(),
      }

      return this.update(id, updateData, { partial: true, skipValidation: true })
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Deleta um produto
   */
  public async deleteProduct(
    id: string,
    userId: string
  ): Promise<ServiceResult<void>> {
    try {
      // Verificar se o produto pertence ao usuário
      const productResult = await this.findById(id)
      if (!productResult.success) {
        return { success: false, error: productResult.error }
      }

      if (productResult.data!.user_id !== userId) {
        return {
          success: false,
          error: {
            message: 'Você não tem permissão para deletar este produto',
            code: 'FORBIDDEN',
          },
        }
      }

      return this.delete(id)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Upload de imagens do produto
   * Retorna as URLs das imagens após upload
   */
  public async uploadProductImages(
    productId: string,
    files: File[]
  ): Promise<ServiceResult<string[]>> {
    try {
      const client = await this.ensureClient()

      if (!files || files.length === 0) {
        return {
          success: false,
          error: {
            message: 'Nenhum arquivo fornecido',
            code: 'NO_FILES',
          },
        }
      }

      if (files.length > 5) {
        return {
          success: false,
          error: {
            message: 'Máximo de 5 imagens por produto',
            code: 'TOO_MANY_FILES',
          },
        }
      }

      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validar tipo do arquivo
        if (!file.type.startsWith('image/')) {
          return {
            success: false,
            error: {
              message: `Arquivo ${file.name} não é uma imagem`,
              code: 'INVALID_FILE_TYPE',
            },
          }
        }

        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          return {
            success: false,
            error: {
              message: `Arquivo ${file.name} excede 5MB`,
              code: 'FILE_TOO_LARGE',
            },
          }
        }

        // Gerar nome único para o arquivo
        const fileExt = file.name.split('.').pop()
        const fileName = `${productId}-${i}-${Date.now()}.${fileExt}`
        const filePath = `products/${fileName}`

        // Upload para o storage
        const { error: uploadError } = await client.storage
          .from('products')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          return this.handleError(uploadError)
        }

        // Obter URL pública
        const { data: { publicUrl } } = client.storage
          .from('products')
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
      }

      return {
        success: true,
        data: uploadedUrls,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Busca produtos por categoria
   */
  public async getByCategory(
    category: string,
    limit: number = 10
  ): Promise<ServiceResult<Product[]>> {
    try {
      const client = await this.ensureClient()

      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .eq('category', category)
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        return this.handleError(error)
      }

      return {
        success: true,
        data: (data || []) as Product[],
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Busca produtos de um usuário específico
   */
  public async getUserProducts(
    userId: string,
    includeInactive: boolean = false
  ): Promise<ServiceResult<Product[]>> {
    try {
      const client = await this.ensureClient()

      let query = client
        .from(this.tableName as any)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!includeInactive) {
        query = query.eq('status', 'available')
      }

      const { data, error } = await query

      if (error) {
        return this.handleError(error)
      }

      return {
        success: true,
        data: (data || []) as Product[],
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Busca produtos similares (mesma categoria, excluindo o produto atual)
   */
  public async getSimilarProducts(
    productId: string,
    limit: number = 5
  ): Promise<ServiceResult<Product[]>> {
    try {
      const productResult = await this.findById(productId)
      if (!productResult.success) {
        return { success: false, error: productResult.error }
      }

      const client = await this.ensureClient()

      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .eq('category', productResult.data!.category)
        .eq('status', 'available')
        .neq('id', productId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        return this.handleError(error)
      }

      return {
        success: true,
        data: (data || []) as Product[],
      }
    } catch (error) {
      return this.handleError(error)
    }
  }
}

// Singleton instance
let productServiceInstance: ProductService | null = null

/**
 * Obtém instância singleton do ProductService
 */
export function getProductService(): ProductService {
  if (!productServiceInstance) {
    productServiceInstance = new ProductService()
  }
  return productServiceInstance
}
