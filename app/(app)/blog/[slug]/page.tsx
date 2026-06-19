import { notFound } from 'next/navigation'
import { getBlogService } from '@/data/blog.service'
import { TopBar } from '@/components/layout/TopBar'
import { renderPostContent } from '@/lib/blog/renderPostContent'

export const dynamic = 'force-dynamic'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const res = await getBlogService().getPostBySlug(slug)
  if (!res.success || !res.data) notFound()
  const post = res.data

  return (
    <>
      <TopBar title="Blog" back />
      <article className="px-4 py-4">
        {post.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image}
            alt=""
            className="mb-4 aspect-video w-full rounded-lg object-cover"
          />
        )}
        <p className="font-body text-[11px] text-tinta-light">
          {formatDate(post.published_at!)} · {post.author_name}
        </p>
        <h1 className="mt-1 font-display text-[22px] font-bold text-tinta">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-col gap-3 font-body text-[14px] leading-relaxed text-tinta">
          {renderPostContent(post.content)}
        </div>
      </article>
    </>
  )
}
