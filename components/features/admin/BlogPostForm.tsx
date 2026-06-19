'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  createBlogPostAction,
  updateBlogPostAction,
  togglePublishBlogPostAction,
  deleteBlogPostAction,
} from '@/app/admin/blog-actions'
import { ImageUploader } from '@/components/features/products/ImageUploader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import type { BlogPost } from '@/types'

export function BlogPostForm({
  post,
  userId,
}: {
  post?: BlogPost
  userId: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const editing = !!post

  const [title, setTitle] = useState(post?.title || '')
  const [summary, setSummary] = useState(post?.summary || '')
  const [content, setContent] = useState(post?.content || '')
  const [coverImage, setCoverImage] = useState<string[]>(
    post?.cover_image ? [post.cover_image] : []
  )
  const [loading, setLoading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const payload = {
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      coverImage: coverImage[0] ?? null,
    }
    const res = editing
      ? await updateBlogPostAction(post!.id, payload)
      : await createBlogPostAction(payload)
    setLoading(false)

    if (!res.success) {
      setError(res.error)
      return
    }
    toast(editing ? 'Post atualizado!' : 'Post criado como rascunho.', 'sucesso')
    router.push('/admin/blog')
    router.refresh()
  }

  async function handleTogglePublish() {
    if (!post) return
    setPublishing(true)
    const res = await togglePublishBlogPostAction(post.id, !post.published_at)
    setPublishing(false)
    if (!res.success) {
      toast(res.error, 'erro')
      return
    }
    toast(post.published_at ? 'Post despublicado.' : 'Post publicado!', 'sucesso')
    router.refresh()
  }

  async function handleDelete() {
    if (!post) return
    if (!confirm(`Remover o post "${post.title}"?`)) return
    setRemoving(true)
    const res = await deleteBlogPostAction(post.id)
    setRemoving(false)
    if (!res.success) {
      toast(res.error, 'erro')
      return
    }
    toast('Post removido.', 'sucesso')
    router.push('/admin/blog')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Título"
        placeholder="Ex.: O fio que liga Jopói, Mutirão e Búzios"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Textarea
        label="Resumo"
        placeholder="Linha curta usada na listagem do blog"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        maxLength={300}
        className="min-h-[70px]"
      />
      <Textarea
        label="Conteúdo"
        hint="Parágrafos separados por linha em branco. Use **texto** para negrito."
        placeholder="Texto completo do post..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[260px]"
      />
      <ImageUploader
        bucket="blog"
        userId={userId}
        max={1}
        value={coverImage}
        onChange={setCoverImage}
        onError={(m) => toast(m, 'erro')}
      />

      {error && <p className="font-body text-[12px] text-erro">{error}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" size="lg" loading={loading} className="flex-1">
          {editing ? 'Salvar' : 'Criar rascunho'}
        </Button>
        {editing && (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            loading={publishing}
            onClick={handleTogglePublish}
          >
            {post!.published_at ? 'Despublicar' : 'Publicar'}
          </Button>
        )}
      </div>
      {editing && (
        <Button
          type="button"
          variant="ghost"
          size="lg"
          loading={removing}
          onClick={handleDelete}
          className="text-erro"
        >
          Remover post
        </Button>
      )}
    </form>
  )
}
