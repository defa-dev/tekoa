import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/session'
import { getTekoinService } from '@/data/tekoin.service'
import {
  BADGE_CATALOG,
  RATING_TEKOIN_TABLE,
  AVISO_TEKOIN_REWARD,
  AVISO_DAILY_CAP,
  HIGHLIGHT_COST,
  HIGHLIGHT_DURATION_DAYS,
  PRIORITY_COST,
  PRIORITY_DURATION_DAYS,
} from '@/lib/tekoins'
import { TopBar } from '@/components/layout/TopBar'
import { InfoTip } from '@/components/ui/InfoTip'
import { Icon } from '@/components/icons/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import type { TekoinTransaction } from '@/types'

export const dynamic = 'force-dynamic'

const TYPE_LABEL: Record<TekoinTransaction['type'], string> = {
  earned_rating: 'Avaliação recebida',
  earned_aviso: 'Aviso publicado',
  admin_adjustment: 'Ajuste',
  spent_highlight: 'Destaque de anúncio',
  spent_priority: 'Prioridade de anúncio',
  donated_feira: 'Pagamento na feira',
  earned_mutirao_base: 'Mutirão',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export default async function TekoinsPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  const [balanceRes, ledgerRes, badgesRes] = await Promise.all([
    getTekoinService().getBalance(profile.id),
    getTekoinService().getLedger(profile.id, 50, 0),
    getTekoinService().getUserBadges(profile.id),
  ])

  const balance = balanceRes.success ? balanceRes.data ?? 0 : 0
  const ledger = ledgerRes.success ? ledgerRes.data ?? [] : []
  const earnedCodes = new Set(
    (badgesRes.success ? badgesRes.data ?? [] : []).map((b) => b.badge_code)
  )

  return (
    <>
      <TopBar
        title="Tekoins"
        back
        titleInfo={
          <InfoTip label="O que são Tekoins?">
            O nome vem de <strong className="text-tinta">Tekoa</strong>. Assim
            como os búzios já foram moeda viva em trocas comunitárias antes do
            dinheiro como conhecemos, o Tekoin tenta lembrar que valor é meio
            de manter relação — não um fim em si. Você ganha avaliando trocas,
            publicando avisos e participando de mutirões; gasta destacando
            anúncios ou pagando parte de uma compra na Feira.
          </InfoTip>
        }
      />

      <div className="flex flex-col gap-5 px-4 py-5">
        <div className="flex items-center gap-3 rounded-lg border border-palha bg-creme-dark p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ouro/20 text-ouro">
            <Icon name="coin" size={26} />
          </div>
          <div>
            <p className="font-strong text-[24px] font-extrabold text-terra">{balance}</p>
            <p className="font-body text-[12px] text-tinta-mid">saldo atual de Tekoins</p>
          </div>
        </div>

        <div className="rounded-lg border border-palha bg-creme-dark p-4">
          <p className="mb-3 font-strong text-[13px] font-bold text-tinta">
            Como ganhar e gastar Tekoins
          </p>

          <p className="mb-1.5 font-body text-[10px] font-medium uppercase tracking-[0.07em] text-tinta-mid">
            Ganhar
          </p>
          <ul className="mb-4 flex flex-col gap-1 font-body text-[13px] text-tinta-mid">
            <li>
              Avaliação após uma troca: até {RATING_TEKOIN_TABLE[5]} Tekoins (escala com
              a nota recebida — os dois lados avaliam e ganham).
            </li>
            <li>
              Aviso publicado no mural: +{AVISO_TEKOIN_REWARD} Tekoin, até{' '}
              {AVISO_DAILY_CAP} por dia.
            </li>
            <li>Participar de um mutirão: mesma escala da avaliação de troca.</li>
          </ul>

          <p className="mb-1.5 font-body text-[10px] font-medium uppercase tracking-[0.07em] text-tinta-mid">
            Gastar
          </p>
          <ul className="flex flex-col gap-1 font-body text-[13px] text-tinta-mid">
            <li>
              Destacar um anúncio: {HIGHLIGHT_COST} Tekoins por {HIGHLIGHT_DURATION_DAYS}{' '}
              dias.
            </li>
            <li>
              Priorizar um anúncio nos resultados: {PRIORITY_COST} Tekoins por{' '}
              {PRIORITY_DURATION_DAYS} dias.
            </li>
            <li>
              Pagar (parte ou todo) um produto na Feira que aceite Tekoins — vira um
              vizinho pra outro, de verdade.
            </li>
          </ul>

          <p className="mt-4 font-body text-[12px] text-tinta-light">
            Badges não se compram: são conquistados automaticamente por marco de saldo
            acumulado.
          </p>
        </div>

        <div>
          <p className="mb-2 font-strong text-[13px] font-bold text-tinta">Badges</p>
          <div className="grid grid-cols-3 gap-2">
            {BADGE_CATALOG.map((badge) => {
              const earned = earnedCodes.has(badge.code)
              return (
                <div
                  key={badge.code}
                  className={`rounded-lg border p-3 text-center ${
                    earned ? 'border-ouro bg-ouro/10' : 'border-palha bg-creme-dark opacity-50'
                  }`}
                >
                  <Icon name="star" size={20} className={earned ? 'mx-auto text-ouro' : 'mx-auto text-tinta-light'} />
                  <p className="mt-1 font-body text-[11px] text-tinta-mid">{badge.label}</p>
                  <p className="font-body text-[10px] text-tinta-light">{badge.milestoneTekoins} Tekoins</p>
                </div>
              )
            })}
          </div>
        </div>

        {ledger.length === 0 ? (
          <EmptyState
            icon="coin"
            title="Nenhum Tekoin ainda"
            description="Avalie suas trocas e publique avisos para começar a acumular."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {ledger.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-lg border border-palha bg-creme-dark px-4 py-3"
              >
                <div>
                  <p className="font-body text-[13px] font-medium text-tinta">
                    {TYPE_LABEL[tx.type] || tx.type}
                  </p>
                  <p className="font-body text-[11px] text-tinta-light">{formatDate(tx.created_at)}</p>
                </div>
                <p
                  className={`font-strong text-[15px] font-bold ${tx.amount >= 0 ? 'text-musgo' : 'text-terra'}`}
                >
                  {tx.amount >= 0 ? '+' : ''}
                  {tx.amount}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
