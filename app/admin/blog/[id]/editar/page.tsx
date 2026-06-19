import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBlogService } from '@/data/blog.service'
import { getCurrentProfile } from '@/lib/auth/session'
import { Icon } from '@/components/icons/Icon'
import { BlogPostForm } from '@/components/features/admin/BlogPostForm'

export const dynamic = 'force-dynamic'

export default async function EditarPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [res, profile] = await Promise.all([
    getBlogService().getPostById(id),
    getCurrentProfile(),
  ])
  if (!res.success || !res.data) notFound()

  return (
    <div>
      <Link
        href="/admin/blog"
        className="mb-4 inline-flex items-center gap-1 font-body text-[13px] text-tinta-mid hover:text-terra"
      >
        <Icon name="arrow-left" size={16} />
        Blog
      </Link>
      <h2 className="mb-5 font-display text-[22px] font-bold text-tinta">
        Editar post
      </h2>
      <BlogPostForm post={res.data} userId={profile!.id} />
    </div>
  )
}
