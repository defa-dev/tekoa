'use client'

import { useMemo, useState } from 'react'
import { Toggle } from '@/components/ui/Toggle'
import { EmptyState } from '@/components/ui/EmptyState'
import { ServiceCard } from './ServiceCard'
import { MutiraoCard } from '@/components/features/mutiroes/MutiraoCard'
import type { ServiceWithUser } from '@/data/service.service'
import type { MutiraoRequest } from '@/types'

export interface MutiraoListItem {
  mutirao: MutiraoRequest
  confirmationCount: number
}

/**
 * Navegador da roda de serviços da comunidade, com alternância entre o que
 * a vizinhança oferece e o que busca. Mutirões (pedidos multi-participante)
 * aparecem junto com os pedidos comuns na aba "Buscam", com uma flag própria
 * — são um tipo de busca, só que precisa de várias mãos.
 */
export function ServicesBrowser({
  services,
  mutiroes = [],
  currentUserId,
}: {
  services: ServiceWithUser[]
  mutiroes?: MutiraoListItem[]
  currentUserId?: string
}) {
  const [view, setView] = useState<'offer' | 'request'>('offer')

  const filtered = useMemo(
    () => services.filter((s) => s.type === view),
    [services, view]
  )

  const isEmpty = filtered.length === 0 && (view === 'offer' || mutiroes.length === 0)

  return (
    <div>
      <Toggle
        aria-label="Ver ofertas ou pedidos"
        options={[
          { value: 'offer', label: 'Oferecem' },
          { value: 'request', label: 'Buscam' },
        ]}
        value={view}
        onChange={setView}
        className="w-full [&>button]:flex-1"
      />

      <div className="mt-3 flex flex-col gap-3">
        {isEmpty ? (
          <EmptyState
            icon="exchange"
            title={view === 'offer' ? 'Nenhuma oferta ainda' : 'Nenhum pedido ainda'}
            description="Quando a vizinhança publicar, aparece aqui. Que tal começar você?"
          />
        ) : (
          <>
            {view === 'request' &&
              mutiroes.map(({ mutirao, confirmationCount }) => (
                <MutiraoCard
                  key={mutirao.id}
                  mutirao={mutirao}
                  confirmationCount={confirmationCount}
                />
              ))}
            {filtered.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                canInteract={service.user_id !== currentUserId}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
