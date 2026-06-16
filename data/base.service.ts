import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type {
  ServiceResult,
  ServiceError,
  BaseFilters,
  PaginatedResult,
  CreateOptions,
  UpdateOptions,
  DeleteOptions,
} from './types'

/**
 * Classe base abstrata para todos os services de dados
 * 
 * Fornece funcionalidade comum para:
 * - Acesso ao cliente Supabase
 * - Tratamento de erros padronizado
 * - Métodos auxiliares para CRUD
 * - Validação de dados
 * 
 * @abstract
 */
export abstract class BaseService<T = any> {
  protected supabase: SupabaseClient<Database> | null = null
  protected tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  /**
   * Inicializa o cliente Supabase
   * Deve ser chamado antes de qualquer operação
   */
  protected async init(): Promise<void> {
    // Sempre cria um cliente fresco — o singleton de instância causava
    // reutilização do cookieStore de uma requisição anterior, quebrando
    // auth.uid() nas RLS policies em requisições subsequentes.
    this.supabase = await createClient()
  }

  /**
   * Garante que o cliente está inicializado.
   *
   * Retorna o cliente com tipagem relaxada de propósito: os services usam
   * nomes de tabela dinâmicos (`this.tableName`) e fazem cast manual das linhas
   * (`as User`, `as Chat`...), então a tipagem genérica do Supabase por tabela
   * não agrega aqui e só gera ruído de `never`.
   */
  protected async ensureClient(): Promise<SupabaseClient> {
    await this.init()
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }
    return this.supabase as unknown as SupabaseClient
  }

  /**
   * Cria um ServiceError a partir de um erro do Supabase
   */
  protected createError(message: string, code?: string, details?: any): ServiceError {
    return {
      message,
      code,
      details,
    }
  }

  /**
   * Trata erros e retorna ServiceResult
   */
  protected handleError(error: any): ServiceResult<never> {
    if (error?.code) {
      return {
        success: false,
        error: this.createError(
          error.message || 'Erro ao processar operação',
          error.code,
          error.details
        ),
      }
    }

    return {
      success: false,
      error: this.createError(
        error?.message || 'Erro desconhecido',
        'UNKNOWN_ERROR',
        error
      ),
    }
  }

  /**
   * Valida dados de entrada
   * Deve ser implementado pelas classes filhas
   */
  protected abstract validate(data: Partial<T>): ServiceResult<T>

  /**
   * Lista registros com filtros e paginação
   */
  protected async list(
    filters?: BaseFilters
  ): Promise<ServiceResult<PaginatedResult<T>>> {
    try {
      const client = await this.ensureClient()

      let query = client
        .from(this.tableName as any)
        .select('*', { count: 'exact' })

      // Aplicar ordenação
      if (filters?.orderBy) {
        query = query.order(filters.orderBy, {
          ascending: filters.orderDirection === 'asc',
        })
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
          data: (data || []) as T[],
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
   * Busca um registro por ID
   */
  protected async findById(id: string): Promise<ServiceResult<T>> {
    try {
      const client = await this.ensureClient()

      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: this.createError('Registro não encontrado', 'NOT_FOUND'),
          }
        }
        return this.handleError(error)
      }

      return {
        success: true,
        data: data as T,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Cria um novo registro
   */
  protected async create(
    data: Partial<T>,
    options?: CreateOptions
  ): Promise<ServiceResult<T>> {
    try {
      // Validar dados se não for skipado
      if (!options?.skipValidation) {
        const validation = this.validate(data)
        if (!validation.success) {
          return validation
        }
      }

      const client = await this.ensureClient()

      const { data: result, error } = await client
        .from(this.tableName as any)
        .insert(data as any)
        .select()
        .single()

      if (error) {
        return this.handleError(error)
      }

      return {
        success: true,
        data: result as T,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Atualiza um registro existente
   */
  protected async update(
    id: string,
    data: Partial<T>,
    options?: UpdateOptions
  ): Promise<ServiceResult<T>> {
    try {
      // Validar dados se não for skipado
      if (!options?.skipValidation && !options?.partial) {
        const validation = this.validate(data)
        if (!validation.success) {
          return validation
        }
      }

      const client = await this.ensureClient()

      const { data: result, error } = await client
        .from(this.tableName as any)
        .update(data as any)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: this.createError('Registro não encontrado', 'NOT_FOUND'),
          }
        }
        return this.handleError(error)
      }

      return {
        success: true,
        data: result as T,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Deleta um registro
   */
  protected async delete(
    id: string,
    options?: DeleteOptions
  ): Promise<ServiceResult<void>> {
    try {
      const client = await this.ensureClient()

      // Soft delete
      if (options?.soft) {
        const { error } = await client
          .from(this.tableName as any)
          .update({ deleted_at: new Date().toISOString() } as any)
          .eq('id', id)

        if (error) {
          return this.handleError(error)
        }

        return { success: true }
      }

      // Hard delete
      const { error } = await client
        .from(this.tableName as any)
        .delete()
        .eq('id', id)

      if (error) {
        return this.handleError(error)
      }

      return { success: true }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Conta registros com filtros opcionais
   */
  protected async count(filters?: Record<string, any>): Promise<ServiceResult<number>> {
    try {
      const client = await this.ensureClient()

      let query = client
        .from(this.tableName as any)
        .select('*', { count: 'exact', head: true })

      // Aplicar filtros
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      const { count, error } = await query

      if (error) {
        return this.handleError(error)
      }

      return {
        success: true,
        data: count || 0,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Verifica se um registro existe
   */
  protected async exists(id: string): Promise<ServiceResult<boolean>> {
    try {
      const result = await this.findById(id)
      return {
        success: true,
        data: result.success && !!result.data,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }
}
