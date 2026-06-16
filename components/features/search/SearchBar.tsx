'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Icon } from '@/components/icons/Icon'

export function SearchBar({ placeholder = 'Buscar...' }: { placeholder?: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const [query, setQuery] = useState(params.get('q') || '')

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        router.push(`?q=${encodeURIComponent(query)}`)
      } else {
        router.push(window.location.pathname)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, router])

  return (
    <div className="relative">
      <Icon
        name="search"
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-tinta-mid"
      />
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-full border border-palha bg-creme-dark py-2.5 pl-10 pr-4 font-body text-[13px] text-tinta placeholder-tinta-mid transition-colors focus:border-terra focus:outline-none"
      />
    </div>
  )
}
