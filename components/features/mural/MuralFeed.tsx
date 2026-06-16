'use client'

import { useMemo, useState } from 'react'
import { Chip } from '@/components/ui/Chip'
import { EmptyState } from '@/components/ui/EmptyState'
import { NoticeCard } from './NoticeCard'
import type { MuralPostWithUser } from '@/data/mural.service'

const FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'event', label: 'Eventos' },
  { value: 'announcement', label: 'Campanhas' },
  { value: 'general', label: 'Recados' },
]

export function MuralFeed({ posts }: { posts: MuralPostWithUser[] }) {
  const [filter, setFilter] = useState('todos')

  const filtered = useMemo(
    () => (filter === 'todos' ? posts : posts.filter((p) => p.type === filter)),
    [posts, filter]
  )

  return (
    <div className="px-4 py-4">
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Chip
            key={f.value}
            label={f.label}
            active={filter === f.value}
            onClick={() => setFilter(f.value)}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <EmptyState
            icon="speakerphone"
            title="Mural tranquilo por aqui"
            description="Compartilhe um aviso, evento ou mutirão e movimente a comunidade."
          />
        ) : (
          filtered.map((post) => <NoticeCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  )
}
