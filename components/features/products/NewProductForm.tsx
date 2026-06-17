'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProductAction } from '@/app/(app)/feira/actions'
import { ImageUploader } from './ImageUploader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/components/ui/Toast'
import { ScopeSelector } from '@/components/features/territory/ScopeSelector'
import { PRODUCT_CATEGORIES } from '@/lib/categories'
import { maskCurrencyInput } from '@/lib/utils'
import type { Reach } from '@/lib/territories'

const CONDITIONS = [
  { value: 'new', label: 'Novo' },
  { value: 'like_new', label: 'Seminovo' },
  { value: 'good', label: 'Bom estado' },
  { value: 'fair', label: 'Usado' },
]

export function NewProductForm({
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

  const [images, setImages] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priceDisplay, setPriceDisplay] = useState('')
  const [priceValue, setPriceValue] = useState(0)
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[0].value)
  const [condition, setCondition] = useState('good')
  const [reach, setReach] = useState<Reach>(userCommunity ? 'own' : 'all')
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (images.length === 0) {
      setError('Adicione ao menos uma foto.')
      return
    }
    if (title.trim().length < 5) {
      setError('O título precisa de ao menos 5 caracteres.')
      return
    }
    if (description.trim().length < 20) {
      setError('Descreva o produto com ao menos 20 caracteres.')
      return
    }
    if (!priceValue || priceValue <= 0) {
      setError('Informe um preço válido.')
      return
    }

    setLoading(true)
    const res = await createProductAction({
      title: title.trim(),
      description: description.trim(),
      price: priceValue,
      category,
      condition: condition as 'new' | 'like_new' | 'good' | 'fair',
      images,
      reach,
      reach_communities: reach === 'selected' ? selected : [],
    })

    if (!res.success) {
      setError(res.error)
      setLoading(false)
      return
    }

    toast('Produto publicado na feira!', 'sucesso')
    router.push(`/feira/${res.data.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 py-5">
      <ImageUploader
        bucket="products"
        userId={userId}
        value={images}
        onChange={setImages}
        onError={(m) => toast(m, 'erro')}
      />

      <Input
        label="O que você está anunciando?"
        placeholder="Ex.: Sofá 2 lugares"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={100}
        required
      />

      <Textarea
        label="Descrição"
        placeholder="Estado, detalhes, motivo da venda/troca..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={1000}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Preço (R$)"
          inputMode="numeric"
          placeholder="0,00"
          value={priceDisplay}
          onChange={(e) => {
            const { display, value } = maskCurrencyInput(e.target.value)
            setPriceDisplay(display)
            setPriceValue(value)
          }}
          required
        />
        <Select
          label="Estado"
          options={CONDITIONS}
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        />
      </div>

      <Select
        label="Categoria"
        options={PRODUCT_CATEGORIES}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
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
        Publicar na feira
      </Button>
    </form>
  )
}
