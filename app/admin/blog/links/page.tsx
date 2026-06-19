import Link from 'next/link'
import { getBlogLinkService } from '@/data/blog-link.service'
import { Icon } from '@/components/icons/Icon'
import { BlogLinksPanel } from '@/components/features/admin/BlogLinksPanel'

export const dynamic = 'force-dynamic'

export default async function AdminBlogLinksPage() {
  const res = await getBlogLinkService().getLinks()
  const links = res.success ? res.data ?? [] : []

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
        Leituras recomendadas
      </h2>
      <BlogLinksPanel links={links} />
    </div>
  )
}
