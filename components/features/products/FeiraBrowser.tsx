'use client'

import { useMemo, useState } from 'react'
import { Chip } from '@/components/ui/Chip'
import { Icon } from '@/components/icons/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductCard } from './ProductCard'
import { PRODUCT_CATEGORIES } from '@/lib/categories'
import type { ProductWithUser } from '@/data/product.service'

/**
 * Vitrine da feira com busca por texto e filtro por categoria (client-side
 * sobre os produtos já carregados).
 */
export function FeiraBrowser({ products }: { products: ProductWithUser[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('todos')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      if (category !== 'todos' && p.category !== category) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      )
    })
  }, [products, query, category])

  return (
    <div className="px-4 py-4">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tinta-light">
          <Icon name="search" size={18} />
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar na feira..."
          className="w-full rounded-md border border-palha bg-creme-dark py-2.5 pl-10 pr-3 font-body text-sm text-tinta placeholder:text-tinta-light focus:border-terra focus:outline-none"
        />
      </div>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        <Chip
          label="Todos"
          active={category === 'todos'}
          onClick={() => setCategory('todos')}
        />
        {PRODUCT_CATEGORIES.map((c) => (
          <Chip
            key={c.value}
            label={c.label}
            active={category === c.value}
            onClick={() => setCategory(c.value)}
          />
        ))}
      </div>

      <div className="mt-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon="bag"
            title="Nada por aqui ainda"
            description="Seja quem inaugura essa prateleira da feira."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
