import Link from 'next/link'
import { getCurrentProfile } from '@/lib/auth/session'
import { getProductService } from '@/data/product.service'
import { getServiceService } from '@/data/service.service'
import { getTekoinService } from '@/data/tekoin.service'
import { getPendingRatingsAction } from './tekoin-actions'
import { PageHeader } from '@/components/layout/PageHeader'
import { bandGraphicFor } from '@/lib/screenGraphics'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/icons/Icon'
import { LogoutButton } from '@/components/features/auth/LogoutButton'
import { PendingRatingsList } from '@/components/features/ratings/PendingRatingsList'

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const profile = await getCurrentProfile()

  const [productsRes, servicesRes, balanceRes, pendingRes] = profile
    ? await Promise.all([
        getProductService().getUserProducts(profile.id),
        getServiceService().getUserServices(profile.id, 'active'),
        getTekoinService().getBalance(profile.id),
        getPendingRatingsAction(),
      ])
    : [null, null, null, null]
  const productCount =
    productsRes && productsRes.success ? productsRes.data!.length : 0
  const serviceCount =
    servicesRes && servicesRes.success ? servicesRes.data!.length : 0
  const tekoinBalance = balanceRes && balanceRes.success ? balanceRes.data ?? 0 : 0
  const pendingRatings = pendingRes && pendingRes.success ? pendingRes.data ?? [] : []

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
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-palha bg-creme-dark p-4 text-center">
            <p className="font-strong text-[22px] font-extrabold text-terra">
              {profile?.total_ratings ?? 0}
            </p>
            <p className="font-body text-[12px] text-tinta-mid">avaliações</p>
          </div>
          <Link
            href="/trocas/minhas"
            className="rounded-lg border border-palha bg-creme-dark p-4 text-center transition-colors hover:border-ouro"
          >
            <p className="font-strong text-[22px] font-extrabold text-terra">
              {serviceCount}
            </p>
            <p className="font-body text-[12px] text-tinta-mid">trocas na roda</p>
          </Link>
          <Link
            href="/feira/minhas"
            className="rounded-lg border border-palha bg-creme-dark p-4 text-center transition-colors hover:border-ouro"
          >
            <p className="font-strong text-[22px] font-extrabold text-terra">
              {productCount}
            </p>
            <p className="font-body text-[12px] text-tinta-mid">itens na feira</p>
          </Link>
        </div>

        <div className="mt-6">
          <SectionLabel>Tekoins</SectionLabel>
          <Link
            href="/perfil/tekoins"
            className="flex items-center gap-3 rounded-lg border border-palha bg-creme-dark p-4 transition-colors hover:border-ouro"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ouro/20 text-ouro">
              <Icon name="coin" size={22} />
            </div>
            <div>
              <p className="font-strong text-[20px] font-extrabold text-terra">{tekoinBalance}</p>
              <p className="font-body text-[12px] text-tinta-mid">Tekoins acumulados — ver extrato</p>
            </div>
            <Icon name="chevron-right" size={18} className="ml-auto text-ouro" />
          </Link>
        </div>

        {pendingRatings.length > 0 && (
          <div className="mt-6">
            <SectionLabel>Avaliações pendentes</SectionLabel>
            <PendingRatingsList items={pendingRatings} />
          </div>
        )}

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
            <Link
              href="/feira/minhas"
              className="flex items-center gap-3 rounded-md px-3 py-3 font-body text-sm text-tinta transition-colors hover:bg-creme"
            >
              <Icon name="bag" size={20} className="text-ouro" />
              Meus produtos
              <Icon name="chevron-right" size={18} className="ml-auto text-ouro" />
            </Link>
            <LogoutButton />
          </div>
        </div>
      </div>
    </>
  )
}
