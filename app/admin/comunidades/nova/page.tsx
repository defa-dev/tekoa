import Link from 'next/link'
import { Icon } from '@/components/icons/Icon'
import { CommunityForm } from '@/components/features/admin/CommunityForm'

export default function NovaComunidadePage() {
  return (
    <div>
      <Link
        href="/admin/comunidades"
        className="mb-4 inline-flex items-center gap-1 font-body text-[13px] text-tinta-mid hover:text-terra"
      >
        <Icon name="arrow-left" size={16} />
        Comunidades
      </Link>
      <h2 className="mb-5 font-display text-[22px] font-bold text-tinta">
        Nova comunidade
      </h2>
      <CommunityForm />
    </div>
  )
}
