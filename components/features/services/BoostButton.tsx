'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { highlightListingAction, priorityListingAction } from '@/app/(app)/perfil/boost-actions'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { HIGHLIGHT_COST, PRIORITY_COST } from '@/lib/tekoins'

/**
 * Gasta Tekoin pra destacar/priorizar um anúncio próprio. Mesmo botão serve
 * pra serviço (troca) e produto (feira) — só um dos dois ids é passado.
 */
export function BoostButton({
  serviceId,
  productId,
}: {
  serviceId?: string | null
  productId?: string | null
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState<'highlight' | 'priority' | null>(null)

  async function handle(kind: 'highlight' | 'priority') {
    setLoading(kind)
    const action = kind === 'highlight' ? highlightListingAction : priorityListingAction
    const res = await action({ serviceId, productId })
    if (!res.success) toast(res.error, 'erro')
    else {
      toast(kind === 'highlight' ? 'Anúncio destacado!' : 'Anúncio priorizado!', 'sucesso')
      router.refresh()
    }
    setLoading(null)
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        loading={loading === 'highlight'}
        disabled={!!loading}
        onClick={() => handle('highlight')}
      >
        Destacar ({HIGHLIGHT_COST} Tekoins)
      </Button>
      <Button
        variant="secondary"
        size="sm"
        loading={loading === 'priority'}
        disabled={!!loading}
        onClick={() => handle('priority')}
      >
        Priorizar ({PRIORITY_COST} Tekoins)
      </Button>
    </>
  )
}
