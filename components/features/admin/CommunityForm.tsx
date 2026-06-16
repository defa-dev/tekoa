'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  createCommunityAction,
  updateCommunityAction,
  deleteCommunityAction,
} from '@/app/admin/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/components/ui/Toast'
import { CommunityMapPicker } from './CommunityMapPicker'
import { COMMUNITY_KINDS } from '@/lib/territories'
import type { Community } from '@/types'

export function CommunityForm({ community }: { community?: Community }) {
  const router = useRouter()
  const { toast } = useToast()
  const editing = !!community

  const [name, setName] = useState(community?.name || '')
  const [kind, setKind] = useState(community?.kind || 'comunidade')
  const [address, setAddress] = useState(community?.address || '')
  const [lat, setLat] = useState<number | null>(community?.lat ?? null)
  const [lng, setLng] = useState<number | null>(community?.lng ?? null)
  const [description, setDescription] = useState(community?.description || '')
  const [loading, setLoading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (name.trim().length < 2) {
      setError('Informe o nome da comunidade.')
      return
    }

    setLoading(true)
    const payload = {
      name: name.trim(),
      kind,
      address: address.trim(),
      description: description.trim(),
      lat,
      lng,
    }
    const res = editing
      ? await updateCommunityAction(community!.id, payload)
      : await createCommunityAction(payload)
    setLoading(false)

    if (!res.success) {
      setError(res.error)
      return
    }
    toast(editing ? 'Comunidade atualizada!' : 'Comunidade criada!', 'sucesso')
    router.push('/admin/comunidades')
    router.refresh()
  }

  async function handleDelete() {
    if (!community) return
    if (!confirm(`Remover a comunidade "${community.name}"?`)) return
    setRemoving(true)
    const res = await deleteCommunityAction(community.id)
    setRemoving(false)
    if (!res.success) {
      toast(res.error, 'erro')
      return
    }
    toast('Comunidade removida.', 'sucesso')
    router.push('/admin/comunidades')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nome da comunidade"
        placeholder="Ex.: Jardim das Acácias"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Select
        label="Alcunha do território"
        options={COMMUNITY_KINDS}
        value={kind}
        onChange={(e) => setKind(e.target.value)}
      />
      <CommunityMapPicker
        lat={lat}
        lng={lng}
        address={address}
        onChange={(v) => {
          setLat(v.lat)
          setLng(v.lng)
          setAddress(v.address)
        }}
      />

      <Textarea
        label="Descrição e informações"
        placeholder="História, características, pontos de referência, contatos..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={2000}
        className="min-h-[140px]"
      />

      {error && <p className="font-body text-[12px] text-erro">{error}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" size="lg" loading={loading} className="flex-1">
          {editing ? 'Salvar' : 'Criar comunidade'}
        </Button>
        {editing && (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            loading={removing}
            onClick={handleDelete}
            className="text-erro"
          >
            Remover
          </Button>
        )}
      </div>
    </form>
  )
}
