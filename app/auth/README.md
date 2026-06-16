# 🔐 Auth Server Actions

Este diretório contém as Server Actions do Next.js para operações de autenticação.

## 📁 Arquivos

- `actions.ts` - Server Actions de autenticação
- `actions.test.ts` - Testes unitários (18 testes, 100% cobertura)

## 🚀 Funções Disponíveis

### signUp(email, password, metadata?)
Cria um novo usuário no sistema.

```typescript
const result = await signUp('user@example.com', 'password123', {
  name: 'João Silva'
})
```

### signIn(email, password)
Autentica um usuário existente.

```typescript
const result = await signIn('user@example.com', 'password123')
```

### signOut()
Faz logout do usuário atual e redireciona para `/login`.

```typescript
await signOut()
```

### resetPassword(email)
Envia email de recuperação de senha.

```typescript
const result = await resetPassword('user@example.com')
```

### updatePassword(newPassword)
Atualiza a senha do usuário autenticado.

```typescript
const result = await updatePassword('newPassword123')
```

## 📊 Tipo de Retorno

Todas as funções (exceto `signOut`) retornam:

```typescript
type AuthResult = {
  success: boolean
  error?: string
  data?: any
}
```

## ✅ Validações

- Email válido (formato básico)
- Senha mínima de 6 caracteres
- Mensagens de erro genéricas para segurança
- Tratamento de exceções

## 🧪 Executar Testes

```bash
npm test -- app/auth/actions.test.ts
```

## 📖 Documentação Completa

Ver: `docs/I.2.4-Server-Actions-Autenticacao.md`
