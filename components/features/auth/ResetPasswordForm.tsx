'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updatePassword } from '@/app/auth/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

export function ResetPasswordForm() {
  const router = useRouter()
  const { toast } = useToast()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!password || password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não conferem')
      return
    }

    setLoading(true)
    try {
      const result = await updatePassword(password)

      if (!result.success) {
        setError(result.error || 'Não foi possível resetar a senha')
        setLoading(false)
        return
      }

      setSuccess(true)
      toast('Senha atualizada com sucesso!', 'sucesso')
      setTimeout(() => router.push('/login'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao resetar senha')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="font-display text-[22px] font-bold text-tinta">
          Pronto!
        </h1>
        <p className="mt-1 font-body text-[13px] text-tinta-mid">
          Sua senha foi resetada com sucesso. Redirecionando para o dashboard...
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col justify-center">
      <h1 className="font-display text-[22px] font-bold text-tinta">
        Nova senha
      </h1>
      <p className="mt-1 font-body text-[13px] text-tinta-mid">
        Escolha uma nova senha para sua conta.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <Input
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error || undefined}
          required
        />
        <Input
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" size="lg" fullWidth loading={loading}>
          Resetar senha
        </Button>
      </form>

      <p className="mt-6 text-center font-body text-[13px] text-tinta-mid">
        Lembrou a senha?{' '}
        <Link href="/login" className="font-medium text-terra">
          Voltar ao login
        </Link>
      </p>
    </div>
  )
}
