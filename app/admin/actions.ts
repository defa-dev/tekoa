'use server'

import { revalidatePath } from 'next/cache'
import { getCommunityService } from '@/data/community.service'
import { ensureAdmin } from '@/lib/auth/admin'
import { getCurrentProfile } from '@/lib/auth/session'
import { geocodeAddress } from '@/lib/geocode'

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

interface CommunityForm {
  name: string
  description?: string
  address?: string
  kind?: string
  lat?: number | null
  lng?: number | null
}

/**
 * Resolve as coordenadas: usa as do mapa (picker) se vierem; senão tenta
 * geocodificar o endereço no servidor (fallback).
 */
async function resolveCoords(input: CommunityForm) {
  if (input.lat != null && input.lng != null) {
    return { lat: input.lat, lng: input.lng }
  }
  if (input.address) {
    const geo = await geocodeAddress(input.address)
    if (geo) return geo
  }
  return { lat: null as number | null, lng: null as number | null }
}

export async function createCommunityAction(
  input: CommunityForm
): Promise<ActionResult<{ id: string }>> {
  if (!(await ensureAdmin())) {
    return { success: false, error: 'Acesso restrito a administradores' }
  }
  if (!input.name || input.name.trim().length < 2) {
    return { success: false, error: 'Informe o nome da comunidade' }
  }

  const { lat, lng } = await resolveCoords(input)
  const profile = await getCurrentProfile()

  const res = await getCommunityService().createCommunity({
    name: input.name,
    description: input.description,
    address: input.address,
    kind: input.kind,
    lat,
    lng,
    created_by: profile?.id ?? null,
  })
  if (!res.success) {
    return { success: false, error: res.error?.message || 'Erro ao criar comunidade' }
  }

  revalidatePath('/admin/comunidades')
  return { success: true, data: { id: res.data!.id } }
}

export async function updateCommunityAction(
  id: string,
  input: CommunityForm
): Promise<ActionResult> {
  if (!(await ensureAdmin())) {
    return { success: false, error: 'Acesso restrito a administradores' }
  }

  const { lat, lng } = await resolveCoords(input)

  const res = await getCommunityService().updateCommunity(id, {
    name: input.name,
    description: input.description,
    address: input.address,
    kind: input.kind,
    lat,
    lng,
  })
  if (!res.success) {
    return { success: false, error: res.error?.message || 'Erro ao salvar' }
  }

  revalidatePath('/admin/comunidades')
  revalidatePath(`/admin/comunidades/${id}/editar`)
  return { success: true, data: null }
}

export async function deleteCommunityAction(id: string): Promise<ActionResult> {
  if (!(await ensureAdmin())) {
    return { success: false, error: 'Acesso restrito a administradores' }
  }
  const res = await getCommunityService().deleteCommunity(id)
  if (!res.success) {
    return { success: false, error: res.error?.message || 'Erro ao remover' }
  }
  revalidatePath('/admin/comunidades')
  return { success: true, data: null }
}
