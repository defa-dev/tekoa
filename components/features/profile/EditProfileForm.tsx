'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateMyProfile } from '@/app/(app)/perfil/actions'
import { uploadImages } from '@/lib/storage/upload'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Icon } from '@/components/icons/Icon'
import { useToast } from '@/components/ui/Toast'
import type { User } from '@/types'

export function EditProfileForm({
  profile,
  communities,
}: {
  profile: User
  communities: string[]
}) {
  const router = useRouter()
  const { toast } = useToast()

  const [fullName, setFullName] = useState(profile.full_name || '')
  const [location, setLocation] = useState(profile.location || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [phone, setPhone] = useState(profile.phone || '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAvatar(file: File | undefined) {
    if (!file) return
    setUploading(true)
    const res = await uploadImages('avatars', profile.id, [file])
    setUploading(false)
    if (res.error) {
      toast(res.error, 'erro')
      return
    }
    if (res.urls[0]) setAvatarUrl(res.urls[0])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (fullName.trim().length < 2) {
      setError('Conte como te chamam (mínimo 2 letras).')
      return
    }

    setLoading(true)
    const res = await updateMyProfile({
      fullName: fullName.trim(),
      location: location.trim() || null,
      bio: bio.trim() || null,
      phone: phone.trim() || null,
      avatarUrl: avatarUrl || null,
    })
    setLoading(false)

    if (!res.success) {
      setError(res.error?.message || 'Erro ao salvar')
      return
    }

    toast('Perfil atualizado!', 'sucesso')
    router.push('/perfil')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 py-5">
      <div className="flex flex-col items-center gap-3">
        <Avatar name={fullName} src={avatarUrl} size={88} />
        <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-ouro px-3 py-1.5 font-body text-[12px] text-terra hover:bg-terra-light">
          <Icon name="camera" size={14} />
          {uploading ? 'Enviando...' : 'Trocar foto'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleAvatar(e.target.files?.[0])}
          />
        </label>
      </div>

      <Input
        label="Nome"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
      {communities.length > 0 ? (
        <Select
          label="Sua comunidade"
          placeholder="Selecione a comunidade"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          options={(location && !communities.includes(location)
            ? [location, ...communities]
            : communities
          ).map((c) => ({ value: c, label: c }))}
        />
      ) : (
        <div>
          <Input
            label="Sua comunidade"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ex.: Jardim das Acácias"
            hint="Nenhuma comunidade cadastrada ainda — peça ao admin para criar."
          />
        </div>
      )}
      <Input
        label="Telefone (opcional)"
        placeholder="(11) 99999-9999"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <Textarea
        label="Sobre você (opcional)"
        placeholder="Conte o que você faz, o que oferece à comunidade..."
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        maxLength={500}
      />

      {error && <p className="font-body text-[12px] text-erro">{error}</p>}

      <Button type="submit" size="lg" fullWidth loading={loading}>
        Salvar
      </Button>
    </form>
  )
}
