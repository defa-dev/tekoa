import Link from 'next/link'
import { getBlogService } from '@/data/blog.service'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/icons/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'

export const dynamic = 'force-dynamic'

export default async function AdminBlogPage() {
  const res = await getBlogService().getAllPostsForAdmin()
  const posts = res.success ? res.data ?? [] : []

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-[22px] font-bold text-tinta">
            Blog
          </h2>
          <p className="font-body text-[13px] text-tinta-mid">
            {posts.length} post{posts.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/blog/links">
            <Button variant="secondary" size="sm">
              Indicações
            </Button>
          </Link>
          <Link href="/admin/blog/novo">
            <Button size="sm">
              <Icon name="plus" size={16} />
              Novo
            </Button>
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon="book"
          title="Nenhum post ainda"
          description="Escreva o primeiro texto do blog do Tekoa."
        >
          <Link href="/admin/blog/novo">
            <Button>Criar post</Button>
          </Link>
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-2">
          {posts.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/blog/${p.id}/editar`}
                className="flex items-center gap-3 rounded-lg border border-palha bg-creme-dark p-3 transition-colors hover:border-ouro"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-terra-light text-terra">
                  <Icon name="book" size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-strong text-[14px] font-bold text-tinta">
                    {p.title}
                  </p>
                  <p className="truncate font-body text-[12px] text-tinta-light">
                    /{p.slug}
                  </p>
                </div>
                <Badge type={p.published_at ? 'evento' : 'categoria'}>
                  {p.published_at ? 'Publicado' : 'Rascunho'}
                </Badge>
                <Icon name="chevron-right" size={18} className="text-ouro" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
