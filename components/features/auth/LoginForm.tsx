'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/app/auth/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { ForgotPasswordForm } from './ForgotPasswordForm'

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn(email, password)

    if (!result.success) {
      setError(result.error || 'Não foi possível entrar')
      setLoading(false)
      return
    }

    toast('Bem-vindo de volta!', 'sucesso')
    const redirectTo = params.get('redirect') || '/dashboard'
    router.push(redirectTo)
    router.refresh()
  }

  if (showForgotPassword) {
    return <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
  }

  return (
    <div className="flex flex-1 flex-col justify-center">
      <h1 className="font-display text-[22px] font-bold text-tinta">
        Que bom te ver
      </h1>
      <p className="mt-1 font-body text-[13px] text-tinta-mid">
        Entre para voltar à roda da sua comunidade.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Senha"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error || undefined}
          required
        />

        <Button type="submit" size="lg" fullWidth loading={loading}>
          Entrar
        </Button>
      </form>

      <button
        type="button"
        onClick={() => setShowForgotPassword(true)}
        className="mt-4 text-center font-body text-[13px] text-tinta-mid transition-colors hover:text-terra"
      >
        Esqueci minha senha
      </button>

      <p className="mt-6 text-center font-body text-[13px] text-tinta-mid">
        Ainda não faz parte?{' '}
        <Link href="/signup" className="font-medium text-terra">
          Entrar na roda
        </Link>
      </p>
    </div>
  )
}
