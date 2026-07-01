import { notFound, redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth/session'
import { getProductService } from '@/data/product.service'
import { TopBar } from '@/components/layout/TopBar'
import { EditProductForm } from '@/components/features/products/EditProductForm'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [user, res] = await Promise.all([
    getAuthUser(),
    getProductService().getProductByIdWithUser(id),
  ])

  if (!user) redirect('/login')
  if (!res.success || !res.data) notFound()

  const product = res.data
  if (product.user_id !== user.id) notFound()

  return (
    <>
      <TopBar title="Editar anúncio" back />
      <EditProductForm product={product} userId={user.id} />
    </>
  )
}
