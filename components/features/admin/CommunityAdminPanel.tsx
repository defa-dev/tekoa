'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { assignCommunityAdminAction } from '@/app/admin/community-admins-actions'
import { topUpCommunityFundAction } from '@/app/admin/community-fund-actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

export function CommunityAdminPanel({
  communityId,
  currentAdminName,
  fundBalance,
}: {
  communityId: string
  currentAdminName: string | null
  fundBalance: number
}) {
  const router = useRouter()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [toppingUp, setToppingUp] = useState(false)

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    setAssigning(true)
    const res = await assignCommunityAdminAction(communityId, email.trim())
    setAssigning(false)
    if (!res.success) {
      toast(res.error, 'erro')
      return
    }
    toast('Admin da comunidade atualizado.', 'sucesso')
    setEmail('')
    router.refresh()
  }

  async function handleTopUp(e: React.FormEvent) {
    e.preventDefault()
    setToppingUp(true)
    const res = await topUpCommunityFundAction(communityId, Number(topUpAmount))
    setToppingUp(false)
    if (!res.success) {
      toast(res.error, 'erro')
      return
    }
    toast('Fundo atualizado.', 'sucesso')
    setTopUpAmount('')
    router.refresh()
  }

  return (
    <div className="mt-6 flex flex-col gap-5">
      <div className="rounded-lg border border-palha bg-creme-dark p-4">
        <h3 className="mb-2 font-strong text-[14px] font-bold text-tinta">Admin da comunidade</h3>
        <p className="mb-3 font-body text-[13px] text-tinta-mid">
          Atual: {currentAdminName || 'ninguém atribuído (sem criador definido)'}
        </p>
        <form onSubmit={handleAssign} className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label="E-mail do novo admin"
              type="email"
              placeholder="morador@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" size="md" loading={assigning}>
            Atribuir
          </Button>
        </form>
      </div>

      <div className="rounded-lg border border-palha bg-creme-dark p-4">
        <h3 className="mb-2 font-strong text-[14px] font-bold text-tinta">Fundo comunitário</h3>
        <p className="mb-3 font-body text-[13px] text-tinta-mid">
          Saldo atual: <strong>{fundBalance} Tekoins</strong>
        </p>
        <form onSubmit={handleTopUp} className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label="Aporte manual (Tekoins)"
              type="number"
              min={1}
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              required
            />
          </div>
          <Button type="submit" size="md" loading={toppingUp}>
            Adicionar
          </Button>
        </form>
      </div>
    </div>
  )
}
