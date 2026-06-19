'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBlogLinkAction, deleteBlogLinkAction } from '@/app/admin/blog-actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/icons/Icon'
import { useToast } from '@/components/ui/Toast'
import type { BlogLink } from '@/types'

export function BlogLinksPanel({ links }: { links: BlogLink[] }) {
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState('')
  const [source, setSource] = useState('')
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = await createBlogLinkAction({
      title: title.trim(),
      source: source.trim(),
      url: url.trim(),
      note: note.trim() || null,
    })
    setLoading(false)

    if (!res.success) {
      setError(res.error)
      return
    }
    setTitle('')
    setSource('')
    setUrl('')
    setNote('')
    toast('Indicação adicionada!', 'sucesso')
    router.refresh()
  }

  async function handleDelete(link: BlogLink) {
    if (!confirm(`Remover a indicação "${link.title}"?`)) return
    setRemovingId(link.id)
    const res = await deleteBlogLinkAction(link.id)
    setRemovingId(null)
    if (!res.success) {
      toast(res.error, 'erro')
      return
    }
    toast('Indicação removida.', 'sucesso')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          label="Título"
          placeholder="Ex.: A economia do Jopói"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Input
          label="Fonte"
          placeholder="Ex.: Teia dos Povos, Revista Piauí..."
          value={source}
          onChange={(e) => setSource(e.target.value)}
          required
        />
        <Input
          label="URL"
          type="url"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <Textarea
          label="Nota (opcional)"
          placeholder="Por que vale a leitura, em 1-2 frases"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={280}
          className="min-h-[60px]"
        />
        {error && <p className="font-body text-[12px] text-erro">{error}</p>}
        <Button type="submit" loading={loading}>
          Adicionar indicação
        </Button>
      </form>

      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.id}>
            <Card className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-strong text-[13px] font-bold text-tinta">
                  {link.title}
                </p>
                <p className="font-body text-[11px] text-tinta-light">
                  {link.source}
                </p>
                {link.note && (
                  <p className="mt-0.5 font-body text-[12px] text-tinta-mid">
                    {link.note}
                  </p>
                )}
              </div>
              <button
                type="button"
                aria-label="Remover indicação"
                onClick={() => handleDelete(link)}
                disabled={removingId === link.id}
                className="shrink-0 rounded-md p-1.5 text-tinta-light hover:bg-creme hover:text-erro disabled:opacity-40"
              >
                <Icon name="x" size={16} />
              </button>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
