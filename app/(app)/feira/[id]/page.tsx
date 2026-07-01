import { notFound } from 'next/navigation'
import { getAuthUser } from '@/lib/auth/session'
import { getProductService } from '@/data/product.service'
import { TopBar } from '@/components/layout/TopBar'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { NegotiateButton } from '@/components/features/products/NegotiateButton'
import { ProductGallery } from '@/components/features/products/ProductGallery'
import { ProductOwnerBar } from '@/components/features/products/ProductOwnerBar'
import { categoryLabel, PRODUCT_CATEGORIES } from '@/lib/categories'
import { formatBRL, timeAgo } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const CONDITION_LABEL: Record<string, string> = {
  new: 'Novo',
  like_new: 'Seminovo',
  good: 'Bom estado',
  fair: 'Usado',
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [user, res] = await Promise.all([
    getAuthUser(),
    getProductService().getProductByIdWithUser(id),
  ])

  if (!res.success || !res.data) notFound()
  const product = res.data
  const isOwner = user?.id === product.user_id
  const owner = product.user?.full_name || 'Vizinho(a)'
  const place = product.user?.location || product.location || 'comunidade'

  return (
    <>
      <TopBar title="Produto" back />

      <div className="mt-3">
        <ProductGallery images={product.images} title={product.title} />
      </div>

      <div className="px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-strong text-[20px] font-bold text-tinta">
            {product.title}
          </h1>
          <span className="shrink-0 font-strong text-[20px] font-extrabold text-terra">
            {formatBRL(product.price)}
          </span>
        </div>

        {isOwner && <ProductOwnerBar product={product} />}

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge type="categoria">
            {categoryLabel(PRODUCT_CATEGORIES, product.category)}
          </Badge>
          <Badge type="feira">{CONDITION_LABEL[product.condition]}</Badge>
          {product.status !== 'available' && (
            <Badge type="troca">
              {product.status === 'sold' ? 'Vendido' : 'Reservado'}
            </Badge>
          )}
        </div>

        <p className="mt-4 whitespace-pre-wrap font-body text-[14px] leading-relaxed text-tinta-mid">
          {product.description}
        </p>

        <div className="mt-5 flex items-center gap-3 rounded-lg border border-palha bg-creme-dark p-3">
          <Avatar name={owner} src={product.user?.avatar_url} size={42} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-body text-sm font-medium text-tinta">
              {owner}
            </p>
            <p className="font-body text-[12px] text-tinta-light">
              {place} · anunciado {timeAgo(product.created_at)}
            </p>
          </div>
        </div>
      </div>

      {!isOwner && (
        <div
          className="sticky bottom-0 border-t border-palha bg-creme px-4 py-3"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
        >
          <NegotiateButton productId={product.id} />
        </div>
      )}
    </>
  )
}
