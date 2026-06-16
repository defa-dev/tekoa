'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createServiceAction } from '@/app/(app)/trocas/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { useToast } from '@/components/ui/Toast'
import { ScopeSelector } from '@/components/features/territory/ScopeSelector'
import { SERVICE_CATEGORIES } from '@/lib/categories'
import type { Reach } from '@/lib/territories'

export function NewServiceForm({
  communities,
  userCommunity,
}: {
  communities: string[]
  userCommunity?: string | null
}) {
  const router = useRouter()
  const { toast } = useToast()

  const [type, setType] = useState<'offer' | 'request'>('offer')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(SERVICE_CATEGORIES[0].value)
  const [proximity, setProximity] = useState('5')
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
    if (description.trim().length < 20) {
      setError('Conte um pouco mais: ao menos 20 caracteres na descrição.')
      return
    }

    setLoading(true)
    const res = await createServiceAction({
      type,
      title: title.trim(),
      description: description.trim(),
      category,
      proximity: Number(proximity) || 5,
      reach,
      reach_communities: reach === 'selected' ? selected : [],
    })

    if (!res.success) {
      setError(res.error)
      setLoading(false)
      return
    }

    toast(
      type === 'offer' ? 'Oferta publicada na roda!' : 'Pedido publicado na roda!',
      'sucesso'
    )
    router.push('/trocas')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 py-5">
      <div>
        <p className="mb-1.5 font-body text-[10px] font-medium uppercase tracking-[0.07em] text-tinta-mid">
          O que você quer fazer?
        </p>
        <Toggle
          aria-label="Tipo de serviço"
          options={[
            { value: 'offer', label: 'Ofereço um serviço' },
            { value: 'request', label: 'Busco um serviço' },
          ]}
          value={type}
          onChange={setType}
          className="w-full [&>button]:flex-1"
        />
      </div>

      <Input
        label="Título"
        placeholder={
          type === 'offer' ? 'Ex.: Conserto elétrico residencial' : 'Ex.: Preciso de aula de violão'
        }
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={100}
        required
      />

      <Textarea
        label="Descrição"
        placeholder="Detalhe o que oferece ou precisa, horários, etc."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={500}
        required
      />

      <Select
        label="Categoria"
        options={SERVICE_CATEGORIES}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <Select
        label="Proximidade (raio)"
        options={[
          { value: '2', label: 'Pertinho — até 2 km' },
          { value: '5', label: 'No bairro — até 5 km' },
          { value: '10', label: 'Região — até 10 km' },
          { value: '20', label: 'Cidade — até 20 km' },
        ]}
        value={proximity}
        onChange={(e) => setProximity(e.target.value)}
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
        Publicar na roda
      </Button>
    </form>
  )
}
