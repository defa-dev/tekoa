'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPostAction } from '@/app/(app)/avisos/actions'
import { ImageUploader } from '@/components/features/products/ImageUploader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/components/ui/Toast'
import { ScopeSelector } from '@/components/features/territory/ScopeSelector'
import type { Reach } from '@/lib/territories'

const TYPES = [
  { value: 'general', label: 'Recado' },
  { value: 'event', label: 'Evento' },
  { value: 'announcement', label: 'Campanha / mutirão' },
]

export function NewPostForm({
  userId,
  communities,
  userCommunity,
}: {
  userId: string
  communities: string[]
  userCommunity?: string | null
}) {
  const router = useRouter()
  const { toast } = useToast()

  const [type, setType] = useState('general')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [reach, setReach] = useState<Reach>(userCommunity ? 'own' : 'all')
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (title.trim().length < 5) {
      setError('O título precisa de ao menos 5 caracteres.')
      return
    }
    if (content.trim().length < 10) {
      setError('Escreva ao menos 10 caracteres no aviso.')
      return
    }

    setLoading(true)
    const res = await createPostAction({
      type: type as 'general' | 'event' | 'announcement',
      title: title.trim(),
      content: content.trim(),
      images,
      reach,
      reach_communities: reach === 'selected' ? selected : [],
    })

    if (!res.success) {
      setError(res.error)
      setLoading(false)
      return
    }

    toast('Aviso publicado no mural!', 'sucesso')
    router.push('/avisos')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 py-5">
      <Select
        label="Tipo de aviso"
        options={TYPES}
        value={type}
        onChange={(e) => setType(e.target.value)}
      />

      <Input
        label="Título"
        placeholder="Ex.: Mutirão de limpeza na praça"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={150}
        required
      />

      <Textarea
        label="Mensagem"
        placeholder="Conte os detalhes: data, local, como participar..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={2000}
        className="min-h-[140px]"
        required
      />

      <ImageUploader
        bucket="mural"
        userId={userId}
        max={3}
        value={images}
        onChange={setImages}
        onError={(m) => toast(m, 'erro')}
      />

      <ScopeSelector
        reach={reach}
        onReachChange={setReach}
        selected={selected}
        onSelectedChange={setSelected}
        communities={communities}
        userCommunity={userCommunity}
      />

      {error && <p className="font-body text-[12px] text-erro">{error}</p>}

      <Button type="submit" size="lg" fullWidth loading={loading}>
        Publicar no mural
      </Button>
    </form>
  )
}
