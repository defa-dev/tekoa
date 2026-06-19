'use client'

import { useState } from 'react'
import { rateUserAction } from '@/app/(chat)/mensagens/[id]/rating-actions'
import { StarRating } from './StarRating'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Icon } from '@/components/icons/Icon'
import { useToast } from '@/components/ui/Toast'

interface RatingSheetProps {
  chatId?: string
  toUserId: string
  toUserName: string
  serviceId?: string | null
  productId?: string | null
  onDone?: () => void
}

/**
 * Botão "Avaliar troca" que abre uma folha inferior com estrelas + comentário.
 * Fecha a roda da reciprocidade: depois da troca, registra-se a confiança
 * (e credita Tekoin a quem é avaliado).
 */
export function RatingSheet({
  chatId,
  toUserId,
  toUserName,
  serviceId,
  productId,
  onDone,
}: RatingSheetProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    const res = await rateUserAction({ chatId, toUserId, rating, comment, serviceId, productId })
    setLoading(false)
    if (!res.success) {
      toast(res.error, 'erro')
      return
    }
    toast('Avaliação registrada. Obrigado!', 'sucesso')
    setOpen(false)
    onDone?.()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-ouro px-3 py-1.5 font-body text-[12px] text-terra hover:bg-terra-light"
      >
        <Icon name="star" size={14} />
        Avaliar
      </button>

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
                Como foi a troca?
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
              Avalie a sua experiência com {toUserName}.
            </p>

            <div className="mb-4 flex justify-center">
              <StarRating value={rating} onChange={setRating} size={36} />
            </div>

            <Textarea
              label="Comentário (opcional)"
              placeholder="Conte como foi..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
            />

            <div className="mt-4">
              <Button fullWidth size="lg" loading={loading} onClick={handleSubmit}>
                Enviar avaliação
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
