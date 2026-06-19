'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { confirmAttendanceAction, cancelMutiraoAction } from '@/app/(app)/mutiroes/actions'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { CloseMutiraoSheet } from './CloseMutiraoSheet'
import { RateOrganizerSheet } from './RateOrganizerSheet'
import type { MutiraoStatus } from '@/types'

interface Participant {
  userId: string
  name: string
}

export function MutiraoActionBar({
  mutiraoId,
  status,
  isOrganizer,
  isConfirmed,
  wasAttended,
  alreadyRatedOrganizer,
  organizerName,
  participants,
}: {
  mutiraoId: string
  status: MutiraoStatus
  isOrganizer: boolean
  isConfirmed: boolean
  wasAttended: boolean
  alreadyRatedOrganizer: boolean
  organizerName: string
  participants: Participant[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const isOpen = status === 'open' || status === 'confirmed'

  async function handleConfirm() {
    setLoading(true)
    const res = await confirmAttendanceAction(mutiraoId)
    setLoading(false)
    if (!res.success) {
      toast(res.error, 'erro')
      return
    }
    toast('Presença confirmada!', 'sucesso')
    router.refresh()
  }

  async function handleCancel() {
    setLoading(true)
    const res = await cancelMutiraoAction(mutiraoId)
    setLoading(false)
    if (!res.success) {
      toast(res.error, 'erro')
      return
    }
    toast('Mutirão cancelado.', 'sucesso')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-2">
      {!isOrganizer && !isConfirmed && isOpen && (
        <Button size="lg" fullWidth loading={loading} onClick={handleConfirm}>
          Confirmar presença
        </Button>
      )}

      {isOrganizer && status === 'confirmed' && (
        <CloseMutiraoSheet mutiraoId={mutiraoId} participants={participants} />
      )}

      {isOrganizer && isOpen && (
        <Button variant="ghost" size="md" fullWidth loading={loading} onClick={handleCancel}>
          Cancelar mutirão
        </Button>
      )}

      {!isOrganizer && status === 'completed' && wasAttended && !alreadyRatedOrganizer && (
        <RateOrganizerSheet mutiraoId={mutiraoId} organizerName={organizerName} />
      )}
    </div>
  )
}
