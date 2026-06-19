import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCommunityService } from '@/data/community.service'
import { getCommunityAdminService } from '@/data/community-admin.service'
import { getCommunityFundService } from '@/data/community-fund.service'
import { getUserService } from '@/data/user.service'
import { Icon } from '@/components/icons/Icon'
import { CommunityForm } from '@/components/features/admin/CommunityForm'
import { CommunityAdminPanel } from '@/components/features/admin/CommunityAdminPanel'
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

  const [adminRes, fundRes] = await Promise.all([
    getCommunityAdminService().getAdminForCommunity(id),
    getCommunityFundService().getBalance(id),
  ])

  let currentAdminName: string | null = null
  if (adminRes.success && adminRes.data) {
    const userRes = await getUserService().getUserById(adminRes.data)
    currentAdminName = (userRes.success ? userRes.data?.full_name : null) ?? null
  }
  const fundBalance = fundRes.success ? fundRes.data ?? 0 : 0

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
      <CommunityAdminPanel
        communityId={id}
        currentAdminName={currentAdminName}
        fundBalance={fundBalance}
      />
    </div>
  )
}
