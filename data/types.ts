/**
 * Types comuns para a camada de dados
 */

/**
 * Resultado padrão de operações
 */
export type ServiceResult<T = any> = {
  success: boolean
  data?: T
  error?: ServiceError
}

/**
 * Erro padronizado do service layer
 */
export interface ServiceError {
  message: string
  code?: string
  details?: any
}

/**
 * Filtros genéricos para listagem
 */
export interface BaseFilters {
  limit?: number
  offset?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

/**
 * Resultado paginado
 */
export interface PaginatedResult<T> {
  data: T[]
  count: number
  hasMore: boolean
  offset: number
}

/**
 * Opções para operações de criação
 */
export interface CreateOptions {
  skipValidation?: boolean
  returnData?: boolean
}

/**
 * Opções para operações de atualização
 */
export interface UpdateOptions {
  skipValidation?: boolean
  returnData?: boolean
  partial?: boolean
}

/**
 * Opções para operações de deleção
 */
export interface DeleteOptions {
  soft?: boolean
  cascade?: boolean
}

/**
 * Metadata para tracking de registros
 */
export interface RecordMetadata {
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  deletedAt?: string | null
}
