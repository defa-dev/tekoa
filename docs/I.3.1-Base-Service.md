# 📦 Base Service - I.3.1

## ✅ Status: Implementado

Esta é a classe base abstrata que fornece funcionalidade comum para todos os services de dados do projeto.

---

## 📁 Arquivos Criados

- ✅ `data/base.service.ts` - Classe base abstrata (331 linhas)
- ✅ `data/types.ts` - Types compartilhados (79 linhas)
- ✅ `data/base.service.test.ts` - Testes unitários (17 testes)

---

## 🎯 Funcionalidades Implementadas

### Classe BaseService<T>

Classe abstrata genérica que fornece operações CRUD padronizadas e tratamento de erros consistente.

#### Métodos Protegidos (para uso em classes filhas):

1. **init() / ensureClient()**
   - Inicializa o cliente Supabase
   - Gerencia singleton do cliente
   - Garante que está inicializado antes de operações

2. **list(filters?: BaseFilters)**
   - Lista registros com paginação
   - Suporta ordenação customizável
   - Retorna contagem total e flag hasMore
   - Filtros: limit, offset, orderBy, orderDirection

3. **findById(id: string)**
   - Busca registro por ID
   - Retorna erro NOT_FOUND se não existir
   - Type-safe com generics

4. **create(data, options?)**
   - Cria novo registro
   - Validação automática (pode ser skipada)
   - Retorna registro criado
   - Opções: skipValidation, returnData

5. **update(id, data, options?)**
   - Atualiza registro existente
   - Suporta atualização parcial
   - Validação customizável
   - Opções: skipValidation, partial, returnData

6. **delete(id, options?)**
   - Deleta registro (hard ou soft)
   - Soft delete: atualiza deleted_at
   - Hard delete: remove do banco
   - Opções: soft, cascade

7. **count(filters?)**
   - Conta registros
   - Suporta filtros customizados
   - Otimizado (head only)

8. **exists(id)**
   - Verifica se registro existe
   - Retorna boolean
   - Usa findById internamente

9. **validate(data) [abstrato]**
   - Deve ser implementado pelas classes filhas
   - Validação específica por entidade
   - Retorna ServiceResult

10. **handleError(error) / createError(...)**
    - Tratamento padronizado de erros
    - Converte erros do Supabase para ServiceError
    - Códigos de erro consistentes

---

## 📊 Types Compartilhados

### ServiceResult<T>
```typescript
type ServiceResult<T = any> = {
  success: boolean
  data?: T
  error?: ServiceError
}
```

### ServiceError
```typescript
interface ServiceError {
  message: string
  code?: string
  details?: any
}
```

### BaseFilters
```typescript
interface BaseFilters {
  limit?: number
  offset?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}
```

### PaginatedResult<T>
```typescript
interface PaginatedResult<T> {
  data: T[]
  count: number
  hasMore: boolean
  offset: number
}
```

### CreateOptions
```typescript
interface CreateOptions {
  skipValidation?: boolean
  returnData?: boolean
}
```

### UpdateOptions
```typescript
interface UpdateOptions {
  skipValidation?: boolean
  returnData?: boolean
  partial?: boolean
}
```

### DeleteOptions
```typescript
interface DeleteOptions {
  soft?: boolean
  cascade?: boolean
}
```

---

## 🧪 Testes Implementados

### Cobertura: 17 testes

#### list (2 testes)
- ✅ Deve listar registros com sucesso
- ✅ Deve retornar erro ao falhar listagem

#### findById (2 testes)
- ✅ Deve buscar registro por ID
- ✅ Deve retornar erro NOT_FOUND quando registro não existe

#### create (3 testes)
- ✅ Deve criar registro com sucesso
- ✅ Deve validar dados antes de criar
- ✅ Deve permitir skip de validação

#### update (3 testes)
- ✅ Deve atualizar registro com sucesso
- ✅ Deve retornar NOT_FOUND ao atualizar registro inexistente
- ✅ Deve permitir atualização parcial sem validação completa

#### delete (3 testes)
- ✅ Deve deletar registro (hard delete)
- ✅ Deve fazer soft delete quando especificado
- ✅ Deve retornar erro ao falhar deleção

#### count (2 testes)
- ✅ Deve contar registros
- ✅ Deve contar com filtros

#### exists (2 testes)
- ✅ Deve retornar true quando registro existe
- ✅ Deve retornar false quando registro não existe

**Executar testes:**
```bash
npm test -- data/base.service.test.ts
```

---

## 💡 Como Usar

### Criando um Service Concreto

```typescript
import { BaseService } from './base.service'
import type { ServiceResult } from './types'

interface MyEntity {
  id: string
  name: string
  email: string
  createdAt: string
}

export class MyService extends BaseService<MyEntity> {
  constructor() {
    super('my_table') // nome da tabela no Supabase
  }

  // Implementar validação obrigatória
  protected validate(data: Partial<MyEntity>): ServiceResult<MyEntity> {
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

    return { success: true, data: data as MyEntity }
  }

  // Métodos públicos customizados
  public async getAll(filters?: BaseFilters) {
    return this.list(filters)
  }

  public async getById(id: string) {
    return this.findById(id)
  }

  public async createRecord(data: Partial<MyEntity>) {
    return this.create(data)
  }

  public async updateRecord(id: string, data: Partial<MyEntity>) {
    return this.update(id, data, { partial: true })
  }

  public async deleteRecord(id: string, soft = false) {
    return this.delete(id, { soft })
  }

  // Métodos específicos do domínio
  public async findByEmail(email: string): Promise<ServiceResult<MyEntity>> {
    try {
      const client = await this.ensureClient()

      const { data, error } = await client
        .from(this.tableName as any)
        .select('*')
        .eq('email', email)
        .single()

      if (error) {
        return this.handleError(error)
      }

      return { success: true, data: data as MyEntity }
    } catch (error) {
      return this.handleError(error)
    }
  }
}
```

### Usando o Service

```typescript
const service = new MyService()

// Criar
const result = await service.createRecord({
  name: 'João Silva',
  email: 'joao@example.com'
})

if (result.success) {
  console.log('Criado:', result.data)
} else {
  console.error('Erro:', result.error?.message)
}

// Listar com paginação
const list = await service.getAll({
  limit: 10,
  offset: 0,
  orderBy: 'createdAt',
  orderDirection: 'desc'
})

// Atualizar
const updated = await service.updateRecord('id-123', {
  name: 'João Pedro Silva'
})

// Deletar (soft)
await service.deleteRecord('id-123', true)
```

---

## ✨ Benefícios

1. **DRY**: Código comum em um só lugar
2. **Type-Safe**: Generics garantem type safety
3. **Consistente**: Erros e respostas padronizados
4. **Testável**: Base bem testada facilita testes dos filhos
5. **Extensível**: Fácil adicionar métodos específicos
6. **Manutenível**: Mudanças propagam automaticamente

---

## 🔗 Dependências

### Usa:
- `@/lib/supabase/server` - Cliente Supabase para server-side
- `@/types/database.types` - Types do schema do banco

### Será usado por:
- `data/user.service.ts` (I.3.2)
- `data/service.service.ts` (I.3.3)
- `data/product.service.ts` (I.3.4)
- `data/mural.service.ts` (I.3.5)
- `data/chat.service.ts` (I.3.6)
- `data/rating.service.ts` (I.3.7)
- `data/storage.service.ts` (I.3.8)

---

## 📋 Próximos Passos

1. ✅ **I.3.1 - Base Service** - Concluído
2. ⏭️ **I.3.2 - User Service** - Próximo
3. ⏭️ **I.3.3 - Service Service** - Após User Service

---

## 📊 Status do Projeto

### Testes Totais: 72 passando ✅
- Auth Actions: 18 testes
- Middleware: 9 testes
- Routes: 17 testes
- useAuth Hook: 6 testes
- useSession Hook: 5 testes
- Base Service: 17 testes

### Módulos Completos:
- ✅ I.1 - Supabase Setup (100%)
- ✅ I.2 - Autenticação (100%)
- 🔄 I.3 - Camada de Abstração (12.5% - 1/8)
