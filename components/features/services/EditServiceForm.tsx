'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateServiceAction } from '@/app/(app)/trocas/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/components/ui/Toast'
import { SERVICE_CATEGORIES } from '@/lib/categories'
import type { Service } from '@/types'

export function EditServiceForm({ service }: { service: Service }) {
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState(service.title)
  const [description, setDescription] = useState(service.description)
  const [category, setCategory] = useState(service.category)
  const [proximity, setProximity] = useState(String(service.proximity ?? 5))
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
      setError('Descreva com ao menos 20 caracteres.')
      return
    }

    setLoading(true)
    const res = await updateServiceAction(service.id, {
      title: title.trim(),
      description: description.trim(),
      category,
      proximity: Number(proximity) || 5,
    })

    if (!res.success) {
      setError(res.error)
      setLoading(false)
      return
    }

    toast('Publicação atualizada!', 'sucesso')
    router.push('/trocas/minhas')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 py-5">
      <Input
        label="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={100}
        required
      />

      <Textarea
        label="Descrição"
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

      {error && <p className="font-body text-[12px] text-erro">{error}</p>}

      <Button type="submit" size="lg" fullWidth loading={loading}>
        Salvar alterações
      </Button>
    </form>
  )
}
