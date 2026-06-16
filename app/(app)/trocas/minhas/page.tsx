import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/session'
import { getServiceService } from '@/data/service.service'
import { getChatService } from '@/data/chat.service'
import { getUserService } from '@/data/user.service'
import { TopBar } from '@/components/layout/TopBar'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/icons/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  MyServiceRow,
  InterestChatRow,
} from '@/components/features/services/MyTradesPanels'

export const dynamic = 'force-dynamic'

export default async function MinhasTrocasPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  const svc = getServiceService()
  const chatSvc = getChatService()

  const servicesRes = await svc.getUserServices(profile.id)
  const services = servicesRes.success ? servicesRes.data ?? [] : []
  const serviceIds = services.map((s) => s.id)

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

  const serviceMap = new Map(services.map((s) => [s.id, s]))

  const pendingByService = received.reduce<Record<string, number>>((acc, chat) => {
    if (chat.status === 'pending' && chat.service_id) {
      acc[chat.service_id] = (acc[chat.service_id] || 0) + 1
    }
    return acc
  }, {})

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
