'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { closeMutiraoAction } from '@/app/(app)/mutiroes/[id]/close-actions'
import { StarRating } from '@/components/features/ratings/StarRating'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Icon } from '@/components/icons/Icon'
import { useToast } from '@/components/ui/Toast'

interface Participant {
  userId: string
  name: string
}

/**
 * Organizador fecha a lista de presença e avalia cada participante de uma
 * vez. O extra é opcional: nunca bloqueia o fechamento se o fundo não tiver
 * saldo (o orquestrador no service lida com isso).
 */
export function CloseMutiraoSheet({
  mutiraoId,
  participants,
}: {
  mutiraoId: string
  participants: Participant[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [attended, setAttended] = useState<Record<string, boolean>>(
    Object.fromEntries(participants.map((p) => [p.userId, true]))
  )
  const [ratings, setRatings] = useState<Record<string, number>>(
    Object.fromEntries(participants.map((p) => [p.userId, 5]))
  )
  const [extraOffered, setExtraOffered] = useState('0')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    const res = await closeMutiraoAction(
      mutiraoId,
      participants.map((p) => ({
        userId: p.userId,
        attended: attended[p.userId],
        rating: ratings[p.userId],
      })),
      Number(extraOffered) || 0
    )
    setLoading(false)
    if (!res.success) {
      toast(res.error, 'erro')
      return
    }
    toast('Mutirão concluído!', 'sucesso')
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button size="lg" fullWidth onClick={() => setOpen(true)}>
        Fechar mutirão e avaliar
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label="Fechar"
            className="absolute inset-0 bg-tinta/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative max-h-[85vh] w-full max-w-[480px] overflow-y-auto rounded-t-2xl bg-creme p-5 sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[18px] font-bold text-tinta">
                Quem participou?
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

            <div className="flex flex-col gap-4">
              {participants.map((p) => (
                <div key={p.userId} className="rounded-lg border border-palha p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-strong text-[14px] font-bold text-tinta">{p.name}</p>
                    <label className="flex items-center gap-1.5 font-body text-[12px] text-tinta-mid">
                      <input
                        type="checkbox"
                        checked={attended[p.userId]}
                        onChange={(e) =>
                          setAttended((prev) => ({ ...prev, [p.userId]: e.target.checked }))
                        }
                      />
                      Esteve presente
                    </label>
                  </div>
                  {attended[p.userId] && (
                    <div className="mt-2">
                      <StarRating
                        value={ratings[p.userId]}
                        onChange={(v) => setRatings((prev) => ({ ...prev, [p.userId]: v }))}
                        size={24}
                      />
                    </div>
                  )}
                </div>
              ))}

              <Input
                label="Extra do fundo comunitário (opcional, em Tekoins)"
                type="number"
                min={0}
                value={extraOffered}
                onChange={(e) => setExtraOffered(e.target.value)}
              />

              <Button fullWidth size="lg" loading={loading} onClick={handleSubmit}>
                Confirmar fechamento
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
