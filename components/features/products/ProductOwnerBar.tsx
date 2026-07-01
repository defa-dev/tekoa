'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteProductAction, updateProductStatusAction } from '@/app/(app)/feira/actions'
import { BoostButton } from '@/components/features/services/BoostButton'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { Icon } from '@/components/icons/Icon'
import type { ProductWithUser } from '@/data/product.service'

export function ProductOwnerBar({ product }: { product: ProductWithUser }) {
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
      router.push('/feira/minhas')
    }
    setLoading(null)
  }

  if (product.status !== 'available') {
    return (
      <p className="mt-2 font-body text-[13px] text-tinta-mid">
        Anúncio {product.status === 'sold' ? 'vendido' : 'reservado'}.
      </p>
    )
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <Link href={`/feira/${product.id}/editar`}>
        <Button variant="secondary" size="sm">
          <Icon name="pencil" size={15} />
          Editar
        </Button>
      </Link>
      <Button
        variant="secondary"
        size="sm"
        loading={loading === 'sold'}
        disabled={!!loading}
        onClick={handleMarkSold}
      >
        Marcar vendido
      </Button>
      <Button
        variant="ghost"
        size="sm"
        loading={loading === 'delete'}
        disabled={!!loading}
        onClick={handleDelete}
      >
        <Icon name="trash" size={15} className="text-terra" />
      </Button>
      <BoostButton productId={product.id} />
    </div>
  )
}
