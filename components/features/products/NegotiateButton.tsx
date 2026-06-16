'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { startProductChatAction } from '@/app/(app)/feira/actions'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/icons/Icon'
import { useToast } from '@/components/ui/Toast'

export function NegotiateButton({ productId }: { productId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const res = await startProductChatAction(productId)
    if (!res.success) {
      toast(res.error, 'erro')
      setLoading(false)
      return
    }
    router.push(`/mensagens/${res.data.chatId}`)
  }

  return (
    <Button size="lg" fullWidth loading={loading} onClick={handleClick}>
      <Icon name="message" size={18} />
      Negociar
    </Button>
  )
}
