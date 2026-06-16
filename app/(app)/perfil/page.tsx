import Link from 'next/link'
import { getCurrentProfile } from '@/lib/auth/session'
import { getProductService } from '@/data/product.service'
import { PageHeader } from '@/components/layout/PageHeader'
import { bandGraphicFor } from '@/lib/screenGraphics'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/icons/Icon'
import { LogoutButton } from '@/components/features/auth/LogoutButton'

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const profile = await getCurrentProfile()

  const productsRes = profile
    ? await getProductService().getUserProducts(profile.id)
    : null
  const productCount =
    productsRes && productsRes.success ? productsRes.data!.length : 0

  return (
    <>
      <PageHeader title="Perfil" graphic={bandGraphicFor('/perfil')}>
        <div className="flex items-center gap-3">
          <Avatar
            name={profile?.full_name}
            src={profile?.avatar_url}
            size={56}
            className="ring-2 ring-creme/40"
          />
          <div>
            <p className="font-strong text-[17px] font-bold text-creme">
              {profile?.full_name || 'Sem nome'}
            </p>
            <p className="font-body text-[12px] text-creme/70">
              {profile?.location || 'Bairro não definido'}
            </p>
          </div>
        </div>
      </PageHeader>

      <div className="px-4 py-5">
        <SectionLabel>Minha atividade</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-palha bg-creme-dark p-4 text-center">
            <p className="font-strong text-[22px] font-extrabold text-terra">
              {profile?.total_ratings ?? 0}
            </p>
            <p className="font-body text-[12px] text-tinta-mid">avaliações</p>
          </div>
          <div className="rounded-lg border border-palha bg-creme-dark p-4 text-center">
            <p className="font-strong text-[22px] font-extrabold text-terra">
              {productCount}
            </p>
            <p className="font-body text-[12px] text-tinta-mid">itens na feira</p>
          </div>
        </div>

        <div className="mt-6">
          <SectionLabel>Conta</SectionLabel>
          <div className="flex flex-col gap-0.5 rounded-lg border border-palha bg-creme-dark p-1">
            <Link
              href="/perfil/editar"
              className="flex items-center gap-3 rounded-md px-3 py-3 font-body text-sm text-tinta transition-colors hover:bg-creme"
            >
              <Icon name="user" size={20} className="text-ouro" />
              Editar perfil
              <Icon name="chevron-right" size={18} className="ml-auto text-ouro" />
            </Link>
            <Link
              href="/mensagens"
              className="flex items-center gap-3 rounded-md px-3 py-3 font-body text-sm text-tinta transition-colors hover:bg-creme"
            >
              <Icon name="message" size={20} className="text-ouro" />
              Minhas conversas
              <Icon name="chevron-right" size={18} className="ml-auto text-ouro" />
            </Link>
            <Link
              href="/trocas/minhas"
              className="flex items-center gap-3 rounded-md px-3 py-3 font-body text-sm text-tinta transition-colors hover:bg-creme"
            >
              <Icon name="exchange" size={20} className="text-ouro" />
              Minhas trocas
              <Icon name="chevron-right" size={18} className="ml-auto text-ouro" />
            </Link>
            <LogoutButton />
          </div>
        </div>
      </div>
    </>
  )
}
