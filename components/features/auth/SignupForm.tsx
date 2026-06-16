'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp, signIn } from '@/app/auth/actions'
import { updateMyProfile } from '@/app/(app)/perfil/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

export function SignupForm() {
  const router = useRouter()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [bairro, setBairro] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (name.trim().length < 2) {
      setError('Conte como te chamam (mínimo 2 letras).')
      return
    }
    if (password.length < 6) {
      setError('A senha precisa de pelo menos 6 caracteres.')
      return
    }

    setLoading(true)

    const result = await signUp(email, password, { full_name: name.trim() })

    if (!result.success) {
      setError(result.error || 'Não foi possível criar a conta')
      setLoading(false)
      return
    }

    // Se o projeto exige confirmação de email, não há sessão ainda.
    const hasSession = !!result.data?.session
    if (!hasSession) {
      // Tenta logar direto (caso confirmação esteja desativada mas sem sessão)
      const login = await signIn(email, password)
      if (!login.success) {
        toast('Conta criada! Confirme seu email para entrar.', 'sucesso')
        router.push('/login')
        return
      }
    }

    // Salva o bairro no perfil (best-effort)
    if (bairro.trim()) {
      await updateMyProfile({ location: bairro.trim() })
    }

    toast('Sua conta está pronta. Bem-vindo à roda!', 'sucesso')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex flex-1 flex-col justify-center">
      <h1 className="font-display text-[22px] font-bold text-tinta">
        Quem é você?
      </h1>
      <p className="mt-1 font-body text-[13px] text-tinta-mid">
        Só o básico por agora.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <Input
          label="Nome"
          placeholder="Como te chamam..."
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Seu bairro"
          placeholder="Ex.: Jardim das Acácias"
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
          hint="Onde fica a sua comunidade (pode ajustar depois)."
        />
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
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error || undefined}
          required
        />

        <Button type="submit" size="lg" fullWidth loading={loading}>
          Continuar
        </Button>
      </form>

      <p className="mt-6 text-center font-body text-[13px] text-tinta-mid">
        Já faz parte?{' '}
        <Link href="/login" className="font-medium text-terra">
          Entrar
        </Link>
      </p>
    </div>
  )
}
