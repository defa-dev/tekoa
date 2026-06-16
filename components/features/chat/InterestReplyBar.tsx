'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  acceptServiceInterestAction,
  declineServiceInterestAction,
} from '@/app/(chat)/mensagens/[id]/interest-actions'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

/**
 * Botões de aceitar/recusar interesse (estilo resposta rápida).
 */
export function InterestReplyBar({ chatId }: { chatId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null)

  async function handleAccept() {
    setLoading('accept')
    const res = await acceptServiceInterestAction(chatId)
    if (!res.success) {
      toast(res.error, 'erro')
      setLoading(null)
      return
    }
    toast('Interesse aceito — combine a troca!', 'sucesso')
    router.refresh()
    setLoading(null)
  }

  async function handleDecline() {
    setLoading('decline')
    const res = await declineServiceInterestAction(chatId)
    if (!res.success) {
      toast(res.error, 'erro')
      setLoading(null)
      return
    }
    toast('Interesse recusado', 'sucesso')
    router.refresh()
    setLoading(null)
  }

  return (
    <div className="border-t border-palha bg-creme-dark px-4 py-3">
      <p className="mb-2 font-body text-[12px] text-tinta-mid">
        Alguém quer combinar essa troca com você:
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1"
          loading={loading === 'accept'}
          disabled={!!loading}
          onClick={handleAccept}
        >
          Aceitar interesse
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          loading={loading === 'decline'}
          disabled={!!loading}
          onClick={handleDecline}
        >
          Recusar
        </Button>
      </div>
    </div>
  )
}
