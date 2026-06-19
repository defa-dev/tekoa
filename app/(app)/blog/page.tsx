import Link from 'next/link'
import { getBlogService } from '@/data/blog.service'
import { getBlogLinkService } from '@/data/blog-link.service'
import { TopBar } from '@/components/layout/TopBar'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/icons/Icon'
import { EmptyState } from '@/components/ui/EmptyState'

export const dynamic = 'force-dynamic'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default async function BlogPage() {
  const [postsRes, linksRes] = await Promise.all([
    getBlogService().getPublishedPosts(),
    getBlogLinkService().getLinks(),
  ])
  const posts = postsRes.success ? postsRes.data ?? [] : []
  const links = linksRes.success ? linksRes.data ?? [] : []

  return (
    <>
      <TopBar title="Blog" />
      <div className="flex flex-col gap-5 px-4 py-4">
        {posts.length === 0 ? (
          <EmptyState
            icon="leaf"
            title="Em breve, os primeiros textos"
            description="Aqui vamos contar o porquê das coisas no Tekoa — as raízes ancestrais por trás do Jopói, do Mutirão e do Tekoin."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {posts.map((post) => (
              <li key={post.id}>
                <Link href={`/blog/${post.slug}`}>
                  <Card interactive>
                    <p className="font-body text-[11px] text-tinta-light">
                      {formatDate(post.published_at!)} · {post.author_name}
                    </p>
                    <h3 className="mt-0.5 font-display text-[17px] font-bold text-tinta">
                      {post.title}
                    </h3>
                    <p className="mt-1 font-body text-[13px] leading-relaxed text-tinta-mid">
                      {post.summary}
                    </p>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {links.length > 0 && (
          <div>
            <h2 className="mb-2 font-display text-[15px] font-bold text-tinta">
              Leituras recomendadas
            </h2>
            <ul className="flex flex-col gap-2">
              {links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Card interactive className="flex items-start gap-2.5">
                      <Icon
                        name="chevron-right"
                        size={16}
                        className="mt-0.5 shrink-0 text-terra"
                      />
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
                    </Card>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  )
}
