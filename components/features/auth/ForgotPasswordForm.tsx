'use client'

import { useState } from 'react'
import { resetPassword } from '@/app/auth/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

export function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await resetPassword(email)

    if (!result.success) {
      setError(result.error || 'Não foi possível enviar o email')
      setLoading(false)
      return
    }

    setSuccess(true)
    toast('Email de recuperação enviado!', 'sucesso')
  }

  if (success) {
    return (
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="font-display text-[22px] font-bold text-tinta">
          Verifique seu email
        </h1>
        <p className="mt-1 font-body text-[13px] text-tinta-mid">
          Enviamos um link de recuperação para <strong>{email}</strong>. Clique nele para resetar sua senha.
        </p>

        <Button
          onClick={onBack}
          variant="secondary"
          size="lg"
          fullWidth
          className="mt-8"
        >
          Voltar ao login
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col justify-center">
      <h1 className="font-display text-[22px] font-bold text-tinta">
        Recuperar senha
      </h1>
      <p className="mt-1 font-body text-[13px] text-tinta-mid">
        Digite seu email e enviaremos um link para resetar sua senha.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error || undefined}
          required
        />

        <Button type="submit" size="lg" fullWidth loading={loading}>
          Enviar link de recuperação
        </Button>
      </form>

      <Button
        onClick={onBack}
        variant="ghost"
        size="lg"
        fullWidth
        className="mt-4"
      >
        Voltar
      </Button>
    </div>
  )
}
