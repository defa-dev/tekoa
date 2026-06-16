import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { formatBRL } from '@/lib/utils'
import type { ProductWithUser } from '@/data/product.service'

const CONDITION_LABEL: Record<string, string> = {
  new: 'Novo',
  like_new: 'Seminovo',
  good: 'Bom estado',
  fair: 'Usado',
}

export function ProductCard({ product }: { product: ProductWithUser }) {
  const owner = product.user?.full_name || 'Vizinho(a)'
  const place = product.user?.location || product.location || 'comunidade'
  const cover = product.images?.[0]

  return (
    <Link
      href={`/feira/${product.id}`}
      className="flex flex-col overflow-hidden rounded-lg border border-palha bg-creme-dark transition-colors hover:border-ouro"
    >
      <div className="relative aspect-square w-full bg-ouro-light">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ouro">
            sem foto
          </div>
        )}
        {product.status !== 'available' && (
          <span className="absolute left-2 top-2">
            <Badge type="troca">
              {product.status === 'sold' ? 'Vendido' : 'Reservado'}
            </Badge>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-2.5">
        <h3 className="line-clamp-1 font-strong text-[13px] font-bold text-tinta">
          {product.title}
        </h3>
        <p className="line-clamp-1 font-body text-[10px] text-tinta-light">
          {owner} · {place}
        </p>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="font-strong text-[15px] font-extrabold text-terra">
            {formatBRL(product.price)}
          </span>
          <span className="font-body text-[9px] uppercase tracking-wide text-tinta-mid">
            {CONDITION_LABEL[product.condition]}
          </span>
        </div>
      </div>
    </Link>
  )
}
