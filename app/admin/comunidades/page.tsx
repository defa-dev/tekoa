import Link from 'next/link'
import { getCommunityService } from '@/data/community.service'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/icons/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import { communityKindLabel } from '@/lib/territories'

export const dynamic = 'force-dynamic'

export default async function AdminComunidadesPage() {
  const res = await getCommunityService().getCommunities()
  const communities = res.success ? res.data ?? [] : []

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-[22px] font-bold text-tinta">
            Comunidades
          </h2>
          <p className="font-body text-[13px] text-tinta-mid">
            {communities.length} cadastrada{communities.length === 1 ? '' : 's'}
          </p>
        </div>
        <Link href="/admin/comunidades/nova">
          <Button size="sm">
            <Icon name="plus" size={16} />
            Nova
          </Button>
        </Link>
      </div>

      {communities.length === 0 ? (
        <EmptyState
          icon="map-pin"
          title="Nenhuma comunidade ainda"
          description="Cadastre a primeira comunidade com nome, endereço e descrição."
        >
          <Link href="/admin/comunidades/nova">
            <Button>Criar comunidade</Button>
          </Link>
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-2">
          {communities.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/comunidades/${c.id}/editar`}
                className="flex items-center gap-3 rounded-lg border border-palha bg-creme-dark p-3 transition-colors hover:border-ouro"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-terra-light text-terra">
                  <Icon name="map-pin" size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-strong text-[14px] font-bold text-tinta">
                    {c.kind ? `${communityKindLabel(c.kind)} ` : ''}
                    {c.name}
                  </p>
                  <p className="truncate font-body text-[12px] text-tinta-light">
                    {c.address || 'sem endereço'}
                    {c.lat != null && c.lng != null ? ' · no mapa ✓' : ' · sem pin'}
                  </p>
                </div>
                <Icon name="chevron-right" size={18} className="text-ouro" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
