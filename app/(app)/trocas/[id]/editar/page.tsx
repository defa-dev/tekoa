import { notFound, redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth/session'
import { getServiceService } from '@/data/service.service'
import { TopBar } from '@/components/layout/TopBar'
import { EditServiceForm } from '@/components/features/services/EditServiceForm'

export const dynamic = 'force-dynamic'

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [user, res] = await Promise.all([
    getAuthUser(),
    getServiceService().getServiceById(id),
  ])

  if (!user) redirect('/login')
  if (!res.success || !res.data) notFound()

  const service = res.data
  if (service.user_id !== user.id) notFound()

  return (
    <>
      <TopBar title="Editar publicação" back />
      <EditServiceForm service={service} />
    </>
  )
}
