'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { startServiceChatAction } from '@/app/(app)/trocas/actions'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

export function InterestButton({
  serviceId,
  ownerName,
}: {
  serviceId: string
  ownerName: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const res = await startServiceChatAction(serviceId)
    if (!res.success) {
      toast(res.error, 'erro')
      setLoading(false)
      return
    }
    toast(
      res.data.existing ? `Conversa com ${ownerName}` : `Interesse enviado para ${ownerName}`,
      'sucesso'
    )
    router.push(`/mensagens/${res.data.chatId}`)
  }

  return (
    <Button variant="secondary" size="sm" loading={loading} onClick={handleClick}>
      Tenho interesse
    </Button>
  )
}
