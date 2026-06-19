import { notFound, redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth/session'
import { getMutiraoService } from '@/data/mutirao.service'
import { getMutiraoMessageService } from '@/data/mutirao-message.service'
import { getUserService } from '@/data/user.service'
import { getTekoinService } from '@/data/tekoin.service'
import { TopBar } from '@/components/layout/TopBar'
import { InfoTip } from '@/components/ui/InfoTip'
import { MutiraoStatusBadge } from '@/components/features/mutiroes/MutiraoStatusBadge'
import { MutiraoActionBar } from '@/components/features/mutiroes/MutiraoActionBar'
import { MutiraoChat } from '@/components/features/mutiroes/MutiraoChat'
import { Icon } from '@/components/icons/Icon'

export const dynamic = 'force-dynamic'

export default async function MutiraoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const mutiraoRes = await getMutiraoService().getMutiraoById(id)
  if (!mutiraoRes.success || !mutiraoRes.data) notFound()
  const mutirao = mutiraoRes.data

  const [confirmationsRes, messagesRes] = await Promise.all([
    getMutiraoService().getConfirmations(id),
    getMutiraoMessageService().getMessages(id),
  ])
  const confirmations = confirmationsRes.success ? confirmationsRes.data ?? [] : []
  const messages = messagesRes.success ? messagesRes.data ?? [] : []

  const userIds = Array.from(
    new Set([mutirao.organizer_id, ...confirmations.map((c) => c.user_id)])
  )
  const usersRes = await getUserService().getUsersByIds(userIds)
  const users = usersRes.success ? usersRes.data ?? [] : []
  const nameOf = (uid: string) => users.find((u) => u.id === uid)?.full_name || 'Vizinho(a)'

  const isOrganizer = user.id === mutirao.organizer_id
  const myConfirmation = confirmations.find((c) => c.user_id === user.id)
  const isConfirmed = !!myConfirmation
  const wasAttended = myConfirmation?.attended === true

  let alreadyRatedOrganizer = false
  if (mutirao.status === 'completed' && !isOrganizer) {
    const res = await getTekoinService().hasMutiraoRating(id, mutirao.organizer_id, user.id)
    alreadyRatedOrganizer = res.success && !!res.data
  }

  const canChat = isOrganizer || isConfirmed
  const participants = confirmations.map((c) => ({ userId: c.user_id, name: nameOf(c.user_id) }))

  return (
    <>
      <TopBar
        title="Mutirão"
        back
        titleInfo={
          <InfoTip label="O que é um mutirão?">
            Mutirão vem do tupi <strong className="text-tinta">mutirõ</strong>{' '}
            (também <em>motyrõ</em>) — trabalho coletivo, ajuda mútua. É assim
            que comunidades quilombolas, aldeias e vilas rurais erguem um
            telhado ou colhem uma lavoura até hoje: sem contratar mão de obra,
            só com gente que aparece porque sabe que, na vez dela, também vai
            aparecer gente.
          </InfoTip>
        }
      />

      <div className="px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-strong text-[20px] font-bold text-tinta">{mutirao.title}</h1>
          <MutiraoStatusBadge status={mutirao.status} />
        </div>

        <p className="mt-3 whitespace-pre-wrap font-body text-[14px] leading-relaxed text-tinta-mid">
          {mutirao.description}
        </p>

        <div className="mt-4 flex flex-col gap-1.5 font-body text-[13px] text-tinta-mid">
          {mutirao.location && (
            <span className="flex items-center gap-2">
              <Icon name="map-pin" size={16} className="text-terra" />
              {mutirao.location}
            </span>
          )}
          {mutirao.scheduled_at && (
            <span className="flex items-center gap-2">
              <Icon name="calendar" size={16} className="text-terra" />
              {new Date(mutirao.scheduled_at).toLocaleString('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
          <span className="flex items-center gap-2">
            <Icon name="users" size={16} className="text-terra" />
            Organizado por {nameOf(mutirao.organizer_id)}
          </span>
        </div>

        <div className="mt-5">
          <h2 className="mb-2 font-display text-[14px] font-bold text-tinta">
            Confirmados ({confirmations.length}/{mutirao.min_confirmations})
          </h2>
          {confirmations.length === 0 ? (
            <p className="font-body text-[13px] text-tinta-light">Ninguém confirmou ainda.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {confirmations.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-palha bg-creme-dark px-3 py-2"
                >
                  <span className="font-body text-[13px] text-tinta">{nameOf(c.user_id)}</span>
                  {mutirao.status === 'completed' && (
                    <Icon
                      name={c.attended ? 'check-circle' : 'x-circle'}
                      size={16}
                      className={c.attended ? 'text-musgo' : 'text-tinta-light'}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-5">
          <MutiraoActionBar
            mutiraoId={id}
            status={mutirao.status}
            isOrganizer={isOrganizer}
            isConfirmed={isConfirmed}
            wasAttended={wasAttended}
            alreadyRatedOrganizer={alreadyRatedOrganizer}
            organizerName={nameOf(mutirao.organizer_id)}
            participants={participants}
          />
        </div>

        {canChat && (
          <div className="mt-6">
            <h2 className="mb-2 font-display text-[14px] font-bold text-tinta">
              Conversa do grupo
            </h2>
            <MutiraoChat
              mutiraoId={id}
              currentUserId={user.id}
              messages={messages}
              userNames={Object.fromEntries(users.map((u) => [u.id, u.full_name || 'Vizinho(a)']))}
            />
          </div>
        )}
      </div>
    </>
  )
}
