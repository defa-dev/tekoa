# Exemplos de Uso - Server Actions de Autenticação

Este documento contém exemplos práticos de como usar as Server Actions de autenticação em diferentes cenários.

## 📝 Formulário de Cadastro

```tsx
'use client'

import { signUp } from '@/app/auth/actions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SignUpForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    const result = await signUp(email, password, { name })

    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error!)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name">Nome</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="password">Senha</label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={6}
          required
          disabled={loading}
        />
      </div>

      {error && (
        <div className="text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
      >
        {loading ? 'Criando conta...' : 'Criar conta'}
      </button>
    </form>
  )
}
```

## 🔓 Formulário de Login

```tsx
'use client'

import { signIn } from '@/app/auth/actions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = await signIn(email, password)

    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error!)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="password">Senha</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          disabled={loading}
        />
      </div>

      {error && (
        <div className="text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
```

## 🚪 Botão de Logout

```tsx
'use client'

import { signOut } from '@/app/auth/actions'
import { useState } from 'react'

export function LogoutButton() {
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    
    try {
      await signOut()
      // Será redirecionado para /login
    } catch (error) {
      // Ignora o erro NEXT_REDIRECT que é esperado
      if (error instanceof Error && error.message !== 'NEXT_REDIRECT') {
        console.error('Erro ao fazer logout:', error)
        setLoading(false)
      }
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
    >
      {loading ? 'Saindo...' : 'Sair'}
    </button>
  )
}
```

## 🔑 Recuperação de Senha

```tsx
'use client'

import { resetPassword } from '@/app/auth/actions'
import { useState } from 'react'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const result = await resetPassword(email)

    if (result.success) {
      setSuccess(true)
      setEmail('')
    } else {
      setError(result.error!)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      {error && (
        <div className="text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="text-green-600">
          Email de recuperação enviado! Verifique sua caixa de entrada.
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
      >
        {loading ? 'Enviando...' : 'Enviar email de recuperação'}
      </button>
    </form>
  )
}
```

## 🔐 Atualizar Senha

```tsx
'use client'

import { updatePassword } from '@/app/auth/actions'
import { useState } from 'react'

export function UpdatePasswordForm() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    const result = await updatePassword(newPassword)

    if (result.success) {
      setSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setError(result.error!)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="newPassword">Nova senha</label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={6}
          required
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword">Confirmar nova senha</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={6}
          required
          disabled={loading}
        />
      </div>

      {error && (
        <div className="text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="text-green-600">
          Senha atualizada com sucesso!
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
      >
        {loading ? 'Atualizando...' : 'Atualizar senha'}
      </button>
    </form>
  )
}
```

## 📱 Uso com React Hook Form

```tsx
'use client'

import { signIn } from '@/app/auth/actions'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'

type LoginFormData = {
  email: string
  password: string
}

export function LoginFormWithHookForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>()

  async function onSubmit(data: LoginFormData) {
    const result = await signIn(data.email, data.password)

    if (result.success) {
      router.push('/dashboard')
    } else {
      setError('root', {
        message: result.error,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email">Email</label>
        <input
          {...register('email', {
            required: 'Email é obrigatório',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email inválido',
            },
          })}
          type="email"
          disabled={isSubmitting}
        />
        {errors.email && (
          <span className="text-red-600">{errors.email.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="password">Senha</label>
        <input
          {...register('password', {
            required: 'Senha é obrigatória',
            minLength: {
              value: 6,
              message: 'Senha deve ter no mínimo 6 caracteres',
            },
          })}
          type="password"
          disabled={isSubmitting}
        />
        {errors.password && (
          <span className="text-red-600">{errors.password.message}</span>
        )}
      </div>

      {errors.root && (
        <div className="text-red-600">
          {errors.root.message}
        </div>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
```

## 🧪 Testando as Actions

```typescript
import { signUp, signIn } from '@/app/auth/actions'

// Teste básico de cadastro
async function testSignUp() {
  const result = await signUp(
    'teste@exemplo.com',
    'senha123',
    { name: 'Usuário Teste' }
  )
  
  console.log('Cadastro:', result.success ? 'Sucesso!' : result.error)
}

// Teste básico de login
async function testSignIn() {
  const result = await signIn('teste@exemplo.com', 'senha123')
  
  console.log('Login:', result.success ? 'Sucesso!' : result.error)
}
```

## 💡 Dicas

1. **Sempre valide no cliente também**: Use validação HTML5 e/ou bibliotecas como React Hook Form
2. **Feedback visual**: Mostre estados de loading e sucesso/erro
3. **Mensagens amigáveis**: Traduza e adapte as mensagens de erro para o usuário
4. **Redirecionamento**: Use `useRouter` para redirecionar após sucesso
5. **Tratamento de erros**: Sempre trate o caso de erro
6. **Loading states**: Desabilite formulários durante submissão
7. **Validação de senha**: Adicione confirmação de senha no cliente

## 🔒 Segurança

- ✅ Nunca exponha dados sensíveis no console em produção
- ✅ Use HTTPS em produção
- ✅ Implemente rate limiting no servidor
- ✅ Adicione CAPTCHA em formulários públicos
- ✅ Use senhas fortes e adicione validação de complexidade
