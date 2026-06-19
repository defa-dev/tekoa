'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  updateProductStatusAction,
  deleteProductAction,
} from '@/app/(app)/feira/actions'
import { BoostButton } from '@/components/features/services/BoostButton'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { categoryLabel, PRODUCT_CATEGORIES } from '@/lib/categories'
import { formatBRL, timeAgo } from '@/lib/utils'
import type { Product } from '@/types'

const STATUS_LABEL: Record<Product['status'], string> = {
  available: 'Disponível',
  reserved: 'Reservado',
  sold: 'Vendido',
}

export function MyProductRow({ product }: { product: Product }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState<'sold' | 'delete' | null>(null)

  async function handleMarkSold() {
    setLoading('sold')
    const res = await updateProductStatusAction(product.id, 'sold')
    if (!res.success) toast(res.error, 'erro')
    else {
      toast('Marcado como vendido!', 'sucesso')
      router.refresh()
    }
    setLoading(null)
  }

  async function handleDelete() {
    if (!confirm('Remover este anúncio da feira?')) return
    setLoading('delete')
    const res = await deleteProductAction(product.id)
    if (!res.success) toast(res.error, 'erro')
    else {
      toast('Anúncio removido', 'sucesso')
      router.refresh()
    }
    setLoading(null)
  }

  return (
    <article className="rounded-lg border border-palha bg-creme-dark p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge type="categoria">{categoryLabel(PRODUCT_CATEGORIES, product.category)}</Badge>
        <Badge type={product.status === 'available' ? 'novo' : 'categoria'}>
          {STATUS_LABEL[product.status]}
        </Badge>
        <span className="ml-auto font-body text-[11px] text-tinta-light">
          {timeAgo(product.created_at)}
        </span>
      </div>

      <h3 className="mt-2 font-strong text-[15px] font-bold text-tinta">{product.title}</h3>
      <p className="mt-0.5 font-strong text-[14px] font-extrabold text-terra">
        {formatBRL(product.price)}
      </p>

      {product.status === 'available' && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            loading={loading === 'sold'}
            disabled={!!loading}
            onClick={handleMarkSold}
          >
            Marcar como vendido
          </Button>
          <Button
            variant="secondary"
            size="sm"
            loading={loading === 'delete'}
            disabled={!!loading}
            onClick={handleDelete}
          >
            Remover
          </Button>
          <BoostButton productId={product.id} />
        </div>
      )}
    </article>
  )
}
