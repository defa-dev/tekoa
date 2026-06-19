'use client'

import { useState } from 'react'
import type { TradeOutcome } from '@/types'
import { closeTradeAction } from '@/app/(chat)/mensagens/[id]/close-actions'
import { rateUserAction } from '@/app/(chat)/mensagens/[id]/rating-actions'
import { StarRating } from '@/components/features/ratings/StarRating'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Icon } from '@/components/icons/Icon'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

interface OutcomeOption {
  value: TradeOutcome
  label: string
  sub: string
  icon: 'check-circle' | 'minus-circle' | 'x-circle'
  selected: string
  idle: string
}

const TROCA_OUTCOMES: OutcomeOption[] = [
  {
    value: 'completed',
    label: 'Deu tudo certo!',
    sub: 'A troca aconteceu e foi boa.',
    icon: 'check-circle',
    selected: 'border-musgo bg-musgo-light text-musgo',
    idle: 'border-palha bg-creme-dark text-tinta hover:border-musgo hover:bg-musgo-light/30',
  },
  {
    value: 'partial',
    label: 'Não tão boa',
    sub: 'A troca aconteceu, mas poderia ser melhor.',
    icon: 'minus-circle',
    selected: 'border-terra bg-terra-light text-terra',
    idle: 'border-palha bg-creme-dark text-tinta hover:border-terra hover:bg-terra-light/30',
  },
  {
    value: 'cancelled',
    label: 'Não rolou',
    sub: 'A combinação não aconteceu. A oferta volta para a roda.',
    icon: 'x-circle',
    selected: 'border-tinta-light bg-creme-dark text-tinta-mid',
    idle: 'border-palha bg-creme-dark text-tinta-mid hover:border-tinta-light',
  },
]

const PRODUTO_OUTCOMES: OutcomeOption[] = [
  {
    value: 'completed',
    label: 'Vendido!',
    sub: 'A negociação aconteceu e o produto foi vendido.',
    icon: 'check-circle',
    selected: 'border-musgo bg-musgo-light text-musgo',
    idle: 'border-palha bg-creme-dark text-tinta hover:border-musgo hover:bg-musgo-light/30',
  },
  {
    value: 'cancelled',
    label: 'Não rolou',
    sub: 'A negociação não aconteceu. O produto continua na feira.',
    icon: 'x-circle',
    selected: 'border-terra bg-terra-light text-terra',
    idle: 'border-palha bg-creme-dark text-tinta hover:border-terra hover:bg-terra-light/30',
  },
]

interface TradeCloseSheetProps {
  chatId: string
  serviceId?: string | null
  productId?: string | null
  productAcceptsTekoins?: boolean
  otherUserId: string
  otherUserName: string
  onDone: () => void
}

export function TradeCloseSheet({
  chatId,
  serviceId,
  productId,
  productAcceptsTekoins = false,
  otherUserId,
  otherUserName,
  onDone,
}: TradeCloseSheetProps) {
  const isProduct = !!productId
  const outcomes = isProduct ? PRODUTO_OUTCOMES : TROCA_OUTCOMES
  const actionLabel = isProduct ? 'Encerrar negociação' : 'Encerrar troca'
  const titleLabel = isProduct ? 'Como foi a negociação?' : 'Como foi a troca?'

  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [outcome, setOutcome] = useState<TradeOutcome | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [tekoinsOffered, setTekoinsOffered] = useState('')
  const [loading, setLoading] = useState(false)

  const canSubmit = outcome !== null && rating > 0
  const showTekoinField = isProduct && productAcceptsTekoins && outcome === 'completed'

  function handleOpen() {
    setOutcome(null)
    setRating(0)
    setComment('')
    setTekoinsOffered('')
    setOpen(true)
  }

  async function handleSubmit() {
    if (!canSubmit) return
    setLoading(true)

    const closeRes = await closeTradeAction(
      chatId,
      outcome,
      showTekoinField ? Number(tekoinsOffered) || undefined : undefined
    )
    if (!closeRes.success) {
      toast(closeRes.error, 'erro')
      setLoading(false)
      return
    }

    const rateRes = await rateUserAction({
      chatId,
      toUserId: otherUserId,
      rating,
      comment,
      serviceId,
      productId,
    })
    if (!rateRes.success) {
      // Já foi encerrado — avisa mas não bloqueia
      toast(
        `${isProduct ? 'Negociação encerrada' : 'Troca encerrada'}, mas a avaliação não foi salva. Tente avaliar depois.`,
        'erro'
      )
    } else {
      toast(
        `${isProduct ? 'Negociação encerrada' : 'Troca encerrada'} e avaliação registrada!`,
        'sucesso'
      )
    }

    setLoading(false)
    setOpen(false)
    onDone()
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="font-body text-[12px] text-tinta-mid underline-offset-2 hover:text-terra hover:underline"
      >
        {actionLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label="Fechar"
            className="absolute inset-0 bg-tinta/40"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-[480px] overflow-y-auto rounded-t-2xl bg-creme p-5 pb-safe sm:max-h-[90vh] sm:rounded-2xl">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-[18px] font-bold text-tinta">
                {titleLabel}
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

            {/* Desfecho */}
            <div className="space-y-2">
              {outcomes.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setOutcome(opt.value)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors',
                    outcome === opt.value ? opt.selected : opt.idle
                  )}
                >
                  <Icon name={opt.icon} size={20} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-strong text-[14px] font-semibold">{opt.label}</p>
                    <p className="font-body text-[12px] opacity-60">{opt.sub}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagamento em Tekoins (opcional, só produto vendido) */}
            {showTekoinField && (
              <div className="mt-4">
                <label className="mb-1 block font-body text-[13px] font-medium text-tinta">
                  Tekoins recebidos do comprador (opcional)
                </label>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="0"
                  value={tekoinsOffered}
                  onChange={(e) => setTekoinsOffered(e.target.value)}
                  className="w-full rounded-md border border-palha bg-creme-dark px-3 py-2 font-body text-sm text-tinta focus:border-terra focus:outline-none"
                />
              </div>
            )}

            {/* Avaliação */}
            <div className="mt-5">
              <p className="mb-1 font-body text-[13px] font-medium text-tinta">
                Avalie {otherUserName}
                <span className="ml-1 text-terra">*</span>
              </p>
              {rating === 0 && (
                <p className="mb-2 font-body text-[11px] text-tinta-light">
                  Clique nas estrelas para avaliar
                </p>
              )}
              <div className="flex justify-center py-1">
                <StarRating value={rating} onChange={setRating} size={38} />
              </div>
            </div>

            {/* Comentário */}
            <div className="mt-4">
              <Textarea
                label="Comentário (opcional)"
                placeholder="Conte como foi a experiência..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
              />
            </div>

            {/* CTA */}
            <div className="mt-5">
              <Button
                fullWidth
                size="lg"
                loading={loading}
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                {actionLabel}
              </Button>
              {!canSubmit && (
                <p className="mt-2 text-center font-body text-[11px] text-tinta-light">
                  {outcome === null
                    ? 'Escolha um desfecho para continuar'
                    : 'Avalie o vizinho com pelo menos 1 estrela'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
