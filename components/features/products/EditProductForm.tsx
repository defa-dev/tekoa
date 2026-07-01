'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProductAction } from '@/app/(app)/feira/actions'
import { ImageUploader } from './ImageUploader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/components/ui/Toast'
import { PRODUCT_CATEGORIES } from '@/lib/categories'
import { maskCurrencyInput } from '@/lib/utils'
import type { ProductWithUser } from '@/data/product.service'

const CONDITIONS = [
  { value: 'new', label: 'Novo' },
  { value: 'like_new', label: 'Seminovo' },
  { value: 'good', label: 'Bom estado' },
  { value: 'fair', label: 'Usado' },
]

export function EditProductForm({
  product,
  userId,
}: {
  product: ProductWithUser
  userId: string
}) {
  const router = useRouter()
  const { toast } = useToast()

  const initialPrice = (product.price / 100).toFixed(2).replace('.', ',')
  const [images, setImages] = useState<string[]>(product.images ?? [])
  const [title, setTitle] = useState(product.title)
  const [description, setDescription] = useState(product.description)
  const [priceDisplay, setPriceDisplay] = useState(initialPrice)
  const [priceValue, setPriceValue] = useState(product.price)
  const [category, setCategory] = useState(product.category)
  const [condition, setCondition] = useState<ProductWithUser['condition']>(product.condition)
  const [acceptsTekoins, setAcceptsTekoins] = useState(product.accepts_tekoins)
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
    const res = await updateProductAction(product.id, {
      title: title.trim(),
      description: description.trim(),
      price: priceValue,
      category,
      condition,
      images,
      accepts_tekoins: acceptsTekoins,
    })

    if (!res.success) {
      setError(res.error)
      setLoading(false)
      return
    }

    toast('Anúncio atualizado!', 'sucesso')
    router.push(`/feira/${product.id}`)
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
          onChange={(e) => setCondition(e.target.value as ProductWithUser['condition'])}
        />
      </div>

      <Select
        label="Categoria"
        options={PRODUCT_CATEGORIES}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <label className="flex items-center gap-2 rounded-lg border border-palha bg-creme-dark px-3 py-3">
        <input
          type="checkbox"
          checked={acceptsTekoins}
          onChange={(e) => setAcceptsTekoins(e.target.checked)}
          className="h-4 w-4 accent-terra"
        />
        <span className="font-body text-[13px] text-tinta">
          Aceito Tekoins como parte do pagamento
        </span>
      </label>

      {error && <p className="font-body text-[12px] text-erro">{error}</p>}

      <Button type="submit" size="lg" fullWidth loading={loading}>
        Salvar alterações
      </Button>
    </form>
  )
}
