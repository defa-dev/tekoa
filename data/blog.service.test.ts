import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BlogService, getBlogService } from './blog.service'

const mockPost = {
  id: 'post-1',
  slug: 'jopoi-mutirao-buzios',
  title: 'O fio que liga Jopói, Mutirão e Búzios',
  summary: 'Resumo do texto fundador.',
  content: 'Conteúdo bem mais longo do que vinte caracteres.',
  cover_image: null,
  author_name: 'Equipe Tekoa',
  published_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

function makeChain(result: { data?: unknown; error?: unknown }) {
  const chain: any = {}
  ;['select', 'insert', 'update', 'delete', 'eq', 'not', 'order', 'limit'].forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain)
  })
  chain.single = vi.fn().mockResolvedValue(result)
  chain.maybeSingle = vi.fn().mockResolvedValue(result)
  chain.then = (resolve: (value: typeof result) => void) => resolve(result)
  return chain
}

function mockServer(chain: ReturnType<typeof makeChain>) {
  vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnValue(chain) } as any)
}

function mockAdmin(chain: ReturnType<typeof makeChain>) {
  vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnValue(chain) } as any)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('BlogService.createPost', () => {
  it('cria o post com slug derivado do título', async () => {
    const chain = makeChain({ data: mockPost, error: null })
    mockAdmin(chain)

    const svc = new BlogService()
    const res = await svc.createPost({
      title: 'O fio que liga Jopói, Mutirão e Búzios',
      summary: 'Resumo do texto fundador.',
      content: 'Conteúdo bem mais longo do que vinte caracteres.',
    })

    expect(res.success).toBe(true)
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'o-fio-que-liga-jopoi-mutirao-e-buzios',
        author_name: 'Equipe Tekoa',
        published_at: null,
      })
    )
  })

  it('rejeita título muito curto', async () => {
    const svc = new BlogService()
    const res = await svc.createPost({ title: 'Oi', summary: 'Resumo válido aqui.', content: 'Conteúdo válido com mais de vinte caracteres.' })
    expect(res.success).toBe(false)
  })

  it('traduz violação de slug duplicado num erro amigável', async () => {
    const chain = makeChain({ data: null, error: { code: '23505', message: 'duplicate key' } })
    mockAdmin(chain)

    const svc = new BlogService()
    const res = await svc.createPost({
      title: 'O fio que liga Jopói, Mutirão e Búzios',
      summary: 'Resumo do texto fundador.',
      content: 'Conteúdo bem mais longo do que vinte caracteres.',
    })

    expect(res.success).toBe(false)
    if (res.success) return
    expect(res.error?.code).toBe('DUPLICATE_SLUG')
  })
})

describe('BlogService.setPublished', () => {
  it('publica preenchendo published_at', async () => {
    const chain = makeChain({ data: { ...mockPost, published_at: new Date().toISOString() }, error: null })
    mockAdmin(chain)

    const svc = new BlogService()
    const res = await svc.setPublished('post-1', true)

    expect(res.success).toBe(true)
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ published_at: expect.any(String) })
    )
  })

  it('despublica zerando published_at', async () => {
    const chain = makeChain({ data: { ...mockPost, published_at: null }, error: null })
    mockAdmin(chain)

    const svc = new BlogService()
    await svc.setPublished('post-1', false)

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ published_at: null })
    )
  })
})

describe('BlogService.getPublishedPosts', () => {
  it('retorna só posts publicados, mais recentes primeiro', async () => {
    const chain = makeChain({ data: [mockPost], error: null })
    mockServer(chain)

    const svc = new BlogService()
    const res = await svc.getPublishedPosts()

    expect(res.success).toBe(true)
    expect(res.data).toHaveLength(1)
    expect(chain.not).toHaveBeenCalledWith('published_at', 'is', null)
  })
})

describe('BlogService.getPostBySlug', () => {
  it('retorna o post quando publicado', async () => {
    const chain = makeChain({ data: mockPost, error: null })
    mockServer(chain)

    const svc = new BlogService()
    const res = await svc.getPostBySlug('jopoi-mutirao-buzios')

    expect(res.success).toBe(true)
    expect(res.data?.slug).toBe('jopoi-mutirao-buzios')
  })

  it('retorna null quando não encontrado', async () => {
    const chain = makeChain({ data: null, error: null })
    mockServer(chain)

    const svc = new BlogService()
    const res = await svc.getPostBySlug('inexistente')

    expect(res.success).toBe(true)
    expect(res.data).toBeNull()
  })
})

describe('BlogService.getAllPostsForAdmin', () => {
  it('retorna rascunhos e publicados via admin client', async () => {
    const draft = { ...mockPost, id: 'post-2', published_at: null }
    const chain = makeChain({ data: [mockPost, draft], error: null })
    mockAdmin(chain)

    const svc = new BlogService()
    const res = await svc.getAllPostsForAdmin()

    expect(res.success).toBe(true)
    expect(res.data).toHaveLength(2)
  })
})

describe('getBlogService singleton', () => {
  it('retorna a mesma instância', () => {
    expect(getBlogService()).toBe(getBlogService())
  })
})
