import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCommunityService } from '@/data/community.service'
import { Icon } from '@/components/icons/Icon'
import { CommunityForm } from '@/components/features/admin/CommunityForm'
import type { Community } from '@/types'

export const dynamic = 'force-dynamic'

export default async function EditarComunidadePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const res = await getCommunityService().getCommunityById(id)
  if (!res.success || !res.data) notFound()

  return (
    <div>
      <Link
        href="/admin/comunidades"
        className="mb-4 inline-flex items-center gap-1 font-body text-[13px] text-tinta-mid hover:text-terra"
      >
        <Icon name="arrow-left" size={16} />
        Comunidades
      </Link>
      <h2 className="mb-5 font-display text-[22px] font-bold text-tinta">
        Editar comunidade
      </h2>
      <CommunityForm community={res.data as Community} />
    </div>
  )
}
