'use client'

import { useMemo, useState } from 'react'
import { Toggle } from '@/components/ui/Toggle'
import { EmptyState } from '@/components/ui/EmptyState'
import { ServiceCard } from './ServiceCard'
import type { ServiceWithUser } from '@/data/service.service'

/**
 * Navegador da roda de serviços da comunidade, com alternância entre o que
 * a vizinhança oferece e o que busca.
 */
export function ServicesBrowser({
  services,
  currentUserId,
}: {
  services: ServiceWithUser[]
  currentUserId?: string
}) {
  const [view, setView] = useState<'offer' | 'request'>('offer')

  const filtered = useMemo(
    () => services.filter((s) => s.type === view),
    [services, view]
  )

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

      <div className="mt-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <EmptyState
            icon="exchange"
            title={view === 'offer' ? 'Nenhuma oferta ainda' : 'Nenhum pedido ainda'}
            description="Quando a vizinhança publicar, aparece aqui. Que tal começar você?"
          />
        ) : (
          filtered.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              canInteract={service.user_id !== currentUserId}
            />
          ))
        )}
      </div>
    </div>
  )
}
