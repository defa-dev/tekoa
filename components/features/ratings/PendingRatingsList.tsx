'use client'

import { useRouter } from 'next/navigation'
import { RatingSheet } from './RatingSheet'
import type { PendingRating } from '@/app/(app)/perfil/tekoin-actions'

/**
 * Trocas/negociações concluídas que o usuário ainda não avaliou. Avaliar
 * aqui credita Tekoin a quem é avaliado — é o substituto do "Avaliar" que
 * existia no chat (removido de lá antes desta feature existir).
 */
export function PendingRatingsList({ items }: { items: PendingRating[] }) {
  const router = useRouter()

  if (items.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.tradeId}
          className="flex items-center justify-between rounded-lg border border-palha bg-creme-dark p-3"
        >
          <div>
            <p className="font-body text-[13px] font-medium text-tinta">
              {item.otherUserName}
            </p>
            <p className="font-body text-[11px] text-tinta-light">
              {item.productId ? 'Negociação concluída' : 'Troca concluída'} — avalie e ganhe Tekoin
            </p>
          </div>
          <RatingSheet
            chatId={item.chatId}
            toUserId={item.otherUserId}
            toUserName={item.otherUserName}
            serviceId={item.serviceId}
            productId={item.productId}
            onDone={() => router.refresh()}
          />
        </div>
      ))}
    </div>
  )
}
