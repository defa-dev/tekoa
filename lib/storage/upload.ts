'use client'

import { createClient } from '@/lib/supabase/client'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

export interface UploadResult {
  urls: string[]
  error?: string
}

/**
 * Faz upload de imagens direto do browser para o Supabase Storage.
 *
 * Usa o cliente do browser (sessão do usuário via cookies), gravando em
 * `<userId>/<arquivo>` — o que satisfaz a política de RLS do storage, que
 * exige que a primeira pasta do caminho seja o id do dono.
 */
export async function uploadImages(
  bucket: 'products' | 'mural' | 'avatars' | 'blog',
  userId: string,
  files: File[]
): Promise<UploadResult> {
  const supabase = createClient()
  const urls: string[] = []

  for (const file of files) {
    if (!ALLOWED.includes(file.type)) {
      return { urls, error: 'Use imagens JPEG, PNG, WebP ou GIF.' }
    }
    if (file.size > MAX_SIZE) {
      return { urls, error: 'Cada imagem pode ter no máximo 5MB.' }
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (error) {
      return { urls, error: error.message || 'Falha no upload da imagem.' }
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    urls.push(data.publicUrl)
  }

  return { urls }
}
