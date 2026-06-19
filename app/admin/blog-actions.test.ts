import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth/admin', () => ({ ensureAdmin: vi.fn() }))
vi.mock('@/lib/auth/session', () => ({ getCurrentProfile: vi.fn() }))
vi.mock('@/data/blog.service', () => ({ getBlogService: vi.fn() }))
vi.mock('@/data/blog-link.service', () => ({ getBlogLinkService: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { ensureAdmin } from '@/lib/auth/admin'
import { getCurrentProfile } from '@/lib/auth/session'
import { getBlogService } from '@/data/blog.service'
import { getBlogLinkService } from '@/data/blog-link.service'
import {
  createBlogPostAction,
  updateBlogPostAction,
  togglePublishBlogPostAction,
  deleteBlogPostAction,
  createBlogLinkAction,
  deleteBlogLinkAction,
} from './blog-actions'

const postInput = { title: 'Título', summary: 'Resumo válido aqui.', content: 'Conteúdo bem mais longo do que vinte caracteres.' }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createBlogPostAction', () => {
  it('bloqueia quem não é admin', async () => {
    vi.mocked(ensureAdmin).mockResolvedValue(false)
    const res = await createBlogPostAction(postInput)
    expect(res.success).toBe(false)
  })

  it('cria o post quando admin', async () => {
    vi.mocked(ensureAdmin).mockResolvedValue(true)
    const createPost = vi.fn().mockResolvedValue({ success: true, data: { id: 'post-1', slug: 'titulo' } })
    vi.mocked(getBlogService).mockReturnValue({ createPost } as any)

    const res = await createBlogPostAction(postInput)

    expect(res.success).toBe(true)
    expect(createPost).toHaveBeenCalledWith(postInput)
  })
})

describe('updateBlogPostAction', () => {
  it('bloqueia quem não é admin', async () => {
    vi.mocked(ensureAdmin).mockResolvedValue(false)
    const res = await updateBlogPostAction('post-1', postInput)
    expect(res.success).toBe(false)
  })

  it('propaga erro quando o service bloqueia', async () => {
    vi.mocked(ensureAdmin).mockResolvedValue(true)
    vi.mocked(getBlogService).mockReturnValue({
      updatePost: vi.fn().mockResolvedValue({ success: false, error: { message: 'Conteúdo muito curto' } }),
    } as any)

    const res = await updateBlogPostAction('post-1', postInput)
    expect(res.success).toBe(false)
  })
})

describe('togglePublishBlogPostAction', () => {
  it('bloqueia quem não é admin', async () => {
    vi.mocked(ensureAdmin).mockResolvedValue(false)
    const res = await togglePublishBlogPostAction('post-1', true)
    expect(res.success).toBe(false)
  })

  it('publica quando admin', async () => {
    vi.mocked(ensureAdmin).mockResolvedValue(true)
    const setPublished = vi.fn().mockResolvedValue({ success: true, data: { slug: 'titulo' } })
    vi.mocked(getBlogService).mockReturnValue({ setPublished } as any)

    const res = await togglePublishBlogPostAction('post-1', true)

    expect(res.success).toBe(true)
    expect(setPublished).toHaveBeenCalledWith('post-1', true)
  })
})

describe('deleteBlogPostAction', () => {
  it('bloqueia quem não é admin', async () => {
    vi.mocked(ensureAdmin).mockResolvedValue(false)
    const res = await deleteBlogPostAction('post-1')
    expect(res.success).toBe(false)
  })

  it('remove quando admin', async () => {
    vi.mocked(ensureAdmin).mockResolvedValue(true)
    const deletePost = vi.fn().mockResolvedValue({ success: true, data: null })
    vi.mocked(getBlogService).mockReturnValue({ deletePost } as any)

    const res = await deleteBlogPostAction('post-1')
    expect(res.success).toBe(true)
  })
})

describe('createBlogLinkAction', () => {
  const linkInput = { title: 'Teia dos Povos', source: 'Teia dos Povos', url: 'https://teiadospovos.org.br' }

  it('bloqueia quem não é admin', async () => {
    vi.mocked(ensureAdmin).mockResolvedValue(false)
    const res = await createBlogLinkAction(linkInput)
    expect(res.success).toBe(false)
  })

  it('cria a indicação com o admin da sessão', async () => {
    vi.mocked(ensureAdmin).mockResolvedValue(true)
    vi.mocked(getCurrentProfile).mockResolvedValue({ id: 'admin-1' } as any)
    const createLink = vi.fn().mockResolvedValue({ success: true, data: { id: 'link-1' } })
    vi.mocked(getBlogLinkService).mockReturnValue({ createLink } as any)

    const res = await createBlogLinkAction(linkInput)

    expect(res.success).toBe(true)
    expect(createLink).toHaveBeenCalledWith('admin-1', linkInput)
  })
})

describe('deleteBlogLinkAction', () => {
  it('bloqueia quem não é admin', async () => {
    vi.mocked(ensureAdmin).mockResolvedValue(false)
    const res = await deleteBlogLinkAction('link-1')
    expect(res.success).toBe(false)
  })

  it('remove quando admin', async () => {
    vi.mocked(ensureAdmin).mockResolvedValue(true)
    const deleteLink = vi.fn().mockResolvedValue({ success: true, data: null })
    vi.mocked(getBlogLinkService).mockReturnValue({ deleteLink } as any)

    const res = await deleteBlogLinkAction('link-1')
    expect(res.success).toBe(true)
  })
})
