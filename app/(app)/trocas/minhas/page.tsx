import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/session'
import { getServiceService } from '@/data/service.service'
import { getChatService } from '@/data/chat.service'
import { getUserService } from '@/data/user.service'
import { getMutiraoService } from '@/data/mutirao.service'
import { TopBar } from '@/components/layout/TopBar'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/icons/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  MyServiceRow,
  InterestChatRow,
} from '@/components/features/services/MyTradesPanels'
import { MutiraoCard } from '@/components/features/mutiroes/MutiraoCard'

export const dynamic = 'force-dynamic'

export default async function MinhasTrocasPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  const svc = getServiceService()
  const chatSvc = getChatService()
  const mutiraoSvc = getMutiraoService()

  const servicesRes = await svc.getUserServices(profile.id)
  const allServices = servicesRes.success ? servicesRes.data ?? [] : []
  const services = allServices.filter((s) => s.status === 'active' || s.status === 'matched')
  const closedServices = allServices.filter((s) => s.status === 'completed' || s.status === 'cancelled')
  const serviceIds = allServices.map((s) => s.id)

  const [sentRes, receivedRes] = await Promise.all([
    chatSvc.getServiceInterestsSent(profile.id),
    chatSvc.getServiceInterestsReceived(profile.id, serviceIds),
  ])

  const sent = sentRes.success ? sentRes.data ?? [] : []
  const received = receivedRes.success ? receivedRes.data ?? [] : []

  const interestServiceIds = Array.from(
    new Set(
      [...sent, ...received]
        .map((c) => c.service_id)
        .filter(Boolean) as string[]
    )
  )

  const interestServices = await Promise.all(
    interestServiceIds.map((id) => svc.getServiceById(id))
  )
  const interestServiceMap = new Map(
    interestServices
      .filter((r) => r.success && r.data)
      .map((r) => [r.data!.id, r.data!.title])
  )

  const otherIds = Array.from(
    new Set(
      [...sent, ...received]
        .map((c) => c.otherParticipantId)
        .filter(Boolean) as string[]
    )
  )
  const usersRes = await getUserService().getUsersByIds(otherIds)
  const userMap = new Map(
    (usersRes.success ? usersRes.data ?? [] : []).map((u) => [u.id, u])
  )

  const pendingByService = received.reduce<Record<string, number>>((acc, chat) => {
    if (chat.status === 'pending' && chat.service_id) {
      acc[chat.service_id] = (acc[chat.service_id] || 0) + 1
    }
    return acc
  }, {})

  const [organizedRes, confirmedRes] = await Promise.all([
    mutiraoSvc.listOrganizedBy(profile.id),
    mutiraoSvc.listConfirmedBy(profile.id),
  ])
  const organized = organizedRes.success ? organizedRes.data ?? [] : []
  const confirmed = confirmedRes.success ? confirmedRes.data ?? [] : []
  const myMutiroes = [...organized, ...confirmed]
  const mutiraoCounts = await Promise.all(
    myMutiroes.map((m) => mutiraoSvc.getConfirmationCount(m.id))
  )
  const mutiraoCountById = new Map(
    myMutiroes.map((m, i) => [m.id, mutiraoCounts[i].success ? mutiraoCounts[i].data ?? 0 : 0])
  )

  return (
    <>
      <TopBar
        title="Minhas trocas"
        back
        action={
          <Link href="/trocas/nova">
            <Button size="sm">
              <Icon name="plus" size={16} />
              Nova
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-6 px-4 py-5">
        <section>
          <SectionLabel>Minhas publicações</SectionLabel>
          {services.length === 0 ? (
            <EmptyState
              icon="exchange"
              title="Nada na roda ainda"
              description="Publique uma oferta ou um pedido para começar a trocar com a vizinhança."
            >
              <Link href="/trocas/nova">
                <Button>Publicar na roda</Button>
              </Link>
            </EmptyState>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {services.map((service) => (
                <MyServiceRow
                  key={service.id}
                  service={service}
                  pendingInterests={pendingByService[service.id] ?? 0}
                />
              ))}
            </div>
          )}
        </section>

        {closedServices.length > 0 && (
          <section>
            <SectionLabel>Encerradas</SectionLabel>
            <div className="mt-3 flex flex-col gap-3">
              {closedServices.map((service) => (
                <MyServiceRow
                  key={service.id}
                  service={service}
                  pendingInterests={0}
                />
              ))}
            </div>
          </section>
        )}

        {(organized.length > 0 || confirmed.length > 0) && (
          <section>
            <SectionLabel>Meus mutirões</SectionLabel>
            <div className="mt-3 flex flex-col gap-3">
              {organized.map((m) => (
                <MutiraoCard key={m.id} mutirao={m} confirmationCount={mutiraoCountById.get(m.id) ?? 0} />
              ))}
              {confirmed.map((m) => (
                <MutiraoCard key={m.id} mutirao={m} confirmationCount={mutiraoCountById.get(m.id) ?? 0} />
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionLabel>Interesses recebidos</SectionLabel>
          <p className="mb-3 font-body text-[12px] text-tinta-mid">
            Vizinhos interessados nas suas ofertas. Aceite ou recuse no chat.
          </p>
          {received.length === 0 ? (
            <p className="font-body text-[13px] text-tinta-light">
              Nenhum interesse recebido por enquanto.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {received.map((chat) => {
                const other = chat.otherParticipantId
                  ? userMap.get(chat.otherParticipantId)
                  : undefined
                const serviceTitle = chat.service_id
                  ? interestServiceMap.get(chat.service_id)
                  : undefined
                return (
                  <InterestChatRow
                    key={chat.id}
                    chatId={chat.id}
                    name={other?.full_name || 'Vizinho(a)'}
                    subtitle={serviceTitle ? `Em: ${serviceTitle}` : 'Troca'}
                    status={chat.status ?? 'active'}
                    href={`/mensagens/${chat.id}`}
                  />
                )
              })}
            </div>
          )}
        </section>

        <section>
          <SectionLabel>Interesses enviados</SectionLabel>
          <p className="mb-3 font-body text-[12px] text-tinta-mid">
            Trocas que você demonstrou interesse — aguardando ou já combinadas.
          </p>
          {sent.length === 0 ? (
            <p className="font-body text-[13px] text-tinta-light">
              Você ainda não demonstrou interesse em nenhuma troca.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {sent.map((chat) => {
                const other = chat.otherParticipantId
                  ? userMap.get(chat.otherParticipantId)
                  : undefined
                const serviceTitle = chat.service_id
                  ? interestServiceMap.get(chat.service_id)
                  : undefined
                return (
                  <InterestChatRow
                    key={chat.id}
                    chatId={chat.id}
                    name={other?.full_name || 'Vizinho(a)'}
                    subtitle={serviceTitle ? `Em: ${serviceTitle}` : 'Troca'}
                    status={chat.status ?? 'active'}
                    href={`/mensagens/${chat.id}`}
                  />
                )
              })}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
