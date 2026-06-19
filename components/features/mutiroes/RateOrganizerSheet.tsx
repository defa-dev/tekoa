'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { rateOrganizerAction } from '@/app/(app)/mutiroes/[id]/close-actions'
import { StarRating } from '@/components/features/ratings/StarRating'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/icons/Icon'
import { useToast } from '@/components/ui/Toast'

export function RateOrganizerSheet({
  mutiraoId,
  organizerName,
}: {
  mutiraoId: string
  organizerName: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    const res = await rateOrganizerAction(mutiraoId, rating)
    setLoading(false)
    if (!res.success) {
      toast(res.error, 'erro')
      return
    }
    toast('Avaliação registrada. Obrigado!', 'sucesso')
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button size="lg" fullWidth onClick={() => setOpen(true)}>
        Avaliar organizador
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label="Fechar"
            className="absolute inset-0 bg-tinta/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-[480px] rounded-t-2xl bg-creme p-5 sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[18px] font-bold text-tinta">
                Como foi o mutirão?
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="flex h-8 w-8 items-center justify-center rounded-md text-tinta-mid hover:bg-creme-dark"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <p className="mb-3 font-body text-[13px] text-tinta-mid">
              Avalie a organização de {organizerName}.
            </p>

            <div className="mb-4 flex justify-center">
              <StarRating value={rating} onChange={setRating} size={36} />
            </div>

            <Button fullWidth size="lg" loading={loading} onClick={handleSubmit}>
              Enviar avaliação
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
