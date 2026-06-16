# 🔐 Server Actions de Autenticação - I.2.4

## ✅ Status: Implementado

Este módulo implementa as Server Actions do Next.js para operações de autenticação seguras no servidor.

---

## 📁 Arquivos Criados

- ✅ `app/auth/actions.ts` - Server Actions de autenticação
- ✅ `app/auth/actions.test.ts` - Testes unitários (18 testes)

---

## 🎯 Funcionalidades Implementadas

### 1. **signUp(email, password, metadata)**
Cria um novo usuário no sistema.

**Parâmetros:**
- `email`: string - Email do usuário
- `password`: string - Senha (mínimo 6 caracteres)
- `metadata`: Record<string, any> (opcional) - Dados adicionais (nome, etc)

**Retorno:**
```typescript
{
  success: boolean
  error?: string
  data?: {
    user: User
    session: Session
  }
}
```

**Validações:**
- ✅ Email válido (formato)
- ✅ Senha com no mínimo 6 caracteres
- ✅ Tratamento de erros do Supabase

**Exemplo de uso:**
```typescript
const result = await signUp(
  'usuario@exemplo.com',
  'senha123',
  { name: 'João Silva' }
)

if (result.success) {
  console.log('Usuário criado:', result.data.user)
} else {
  console.error('Erro:', result.error)
}
```

---

### 2. **signIn(email, password)**
Autentica um usuário existente.

**Parâmetros:**
- `email`: string - Email do usuário
- `password`: string - Senha do usuário

**Retorno:**
```typescript
{
  success: boolean
  error?: string
  data?: {
    user: User
    session: Session
  }
}
```

**Validações:**
- ✅ Email válido
- ✅ Senha obrigatória
- ✅ Mensagem genérica para credenciais incorretas (segurança)

**Exemplo de uso:**
```typescript
const result = await signIn('usuario@exemplo.com', 'senha123')

if (result.success) {
  // Redirecionar para dashboard
} else {
  console.error('Login falhou:', result.error)
}
```

---

### 3. **signOut()**
Faz logout do usuário atual.

**Retorno:**
- Redireciona para `/login` em caso de sucesso
- Retorna `AuthResult` em caso de erro

**Comportamento:**
- ✅ Invalida a sessão no Supabase
- ✅ Revalida o cache do Next.js
- ✅ Redireciona automaticamente para `/login`

**Exemplo de uso:**
```typescript
try {
  await signOut()
  // Redirecionado para /login
} catch (error) {
  if (error.message !== 'NEXT_REDIRECT') {
    console.error('Erro ao fazer logout:', error)
  }
}
```

---

### 4. **resetPassword(email)**
Envia email de recuperação de senha.

**Parâmetros:**
- `email`: string - Email do usuário

**Retorno:**
```typescript
{
  success: boolean
  error?: string
  data?: {
    message: string
  }
}
```

**Validações:**
- ✅ Email válido
- ✅ Tratamento de erros do Supabase

**Configuração necessária:**
- Variável de ambiente: `NEXT_PUBLIC_SITE_URL`
- URL de redirecionamento: `/auth/reset-password`

**Exemplo de uso:**
```typescript
const result = await resetPassword('usuario@exemplo.com')

if (result.success) {
  console.log('Email enviado!')
} else {
  console.error('Erro:', result.error)
}
```

---

### 5. **updatePassword(newPassword)**
Atualiza a senha do usuário autenticado.

**Parâmetros:**
- `newPassword`: string - Nova senha (mínimo 6 caracteres)

**Retorno:**
```typescript
{
  success: boolean
  error?: string
  data?: {
    user: User
  }
}
```

**Validações:**
- ✅ Senha com no mínimo 6 caracteres
- ✅ Usuário deve estar autenticado

**Exemplo de uso:**
```typescript
const result = await updatePassword('novaSenha123')

if (result.success) {
  console.log('Senha atualizada!')
} else {
  console.error('Erro:', result.error)
}
```

---

## 🧪 Testes Implementados

### Cobertura de Testes: 18 testes

#### signUp (5 testes)
- ✅ Deve criar um novo usuário com sucesso
- ✅ Deve retornar erro para email inválido
- ✅ Deve retornar erro para senha curta
- ✅ Deve retornar erro do Supabase quando falhar
- ✅ Deve tratar exceções inesperadas

#### signIn (4 testes)
- ✅ Deve fazer login com sucesso
- ✅ Deve retornar erro para email inválido
- ✅ Deve retornar erro para senha vazia
- ✅ Deve retornar erro genérico para credenciais incorretas

#### signOut (2 testes)
- ✅ Deve fazer logout com sucesso
- ✅ Deve retornar erro quando o logout falhar

#### resetPassword (3 testes)
- ✅ Deve enviar email de recuperação com sucesso
- ✅ Deve retornar erro para email inválido
- ✅ Deve retornar erro do Supabase quando falhar

#### updatePassword (4 testes)
- ✅ Deve atualizar senha com sucesso
- ✅ Deve retornar erro para senha curta
- ✅ Deve retornar erro do Supabase quando falhar
- ✅ Deve tratar exceções inesperadas

**Executar testes:**
```bash
npm test -- app/auth/actions.test.ts
```

---

## 🔒 Segurança

### Validações Implementadas
1. **Validação de Email**: Verifica formato básico (@)
2. **Validação de Senha**: Mínimo 6 caracteres
3. **Mensagens de Erro Genéricas**: Não expõe informações sensíveis
4. **Server-Side Only**: Executado apenas no servidor

### Boas Práticas
- ✅ Uso de `'use server'` directive
- ✅ Validação antes de chamar o Supabase
- ✅ Tratamento de erros consistente
- ✅ Revalidação de cache após operações
- ✅ Não expõe detalhes de erros de autenticação

---

## 🔗 Dependências

### Usa:
- `@/lib/supabase/server` - Cliente Supabase para server-side
- `next/navigation` - Para redirecionamentos
- `next/cache` - Para revalidação de cache

### Usado por:
- Formulários de login/cadastro (a implementar no Pacote 2)
- Páginas de autenticação (a implementar no Pacote 2)
- Componentes de perfil (a implementar no Pacote 2)

---

## 📋 Próximos Passos

1. ✅ **I.2.4 - Server Actions** - Concluído
2. ⏭️ **I.3.1 - Base Service** - Próximo
3. ⏭️ **I.3.2 - User Service** - Após base service

---

## 💡 Exemplos de Integração

### Em um formulário de cadastro:
```tsx
'use client'

import { signUp } from '@/app/auth/actions'
import { useState } from 'react'

export function SignUpForm() {
  const [error, setError] = useState('')
  
  async function handleSubmit(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    
    const result = await signUp(email, password, { name })
    
    if (!result.success) {
      setError(result.error!)
    }
  }
  
  return (
    <form action={handleSubmit}>
      {/* campos do formulário */}
    </form>
  )
}
```

### Em um formulário de login:
```tsx
'use client'

import { signIn } from '@/app/auth/actions'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const router = useRouter()
  
  async function handleSubmit(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    const result = await signIn(email, password)
    
    if (result.success) {
      router.push('/dashboard')
    }
  }
  
  return (
    <form action={handleSubmit}>
      {/* campos do formulário */}
    </form>
  )
}
```

---

## 📊 Status do Pacote 1

### I.2 - Autenticação
- [x] I.2.1 - Clientes Supabase ✅
- [x] I.2.2 - Hooks de autenticação ✅
- [x] I.2.3 - Middleware de proteção ✅
- [x] I.2.4 - Server Actions de auth ✅

**Autenticação: 100% Completa! 🎉**
