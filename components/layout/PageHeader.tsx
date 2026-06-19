'use client'

import Link from 'next/link'
import { Icon } from '@/components/icons/Icon'
import { useTekoinBalance } from './TekoinBalanceContext'

export interface PageHeaderProps {
  /** Linha pequena acima do título (ex.: saudação) */
  eyebrow?: string
  title: string
  /** Elemento ao lado do título (ex.: ícone de informação) */
  titleInfo?: React.ReactNode
  /** Texto do badge de comunidade (ex.: bairro) */
  community?: string
  /** Ação no canto superior direito (ex.: ícone de conversas) */
  action?: React.ReactNode
  /** Composição de grafismo (temporariamente não usada — faixa em cor sólida) */
  graphic?: string
  children?: React.ReactNode
}

/**
 * Header de seção (dashboard, perfil).
 * Temporariamente em cor sólida — o fundo com grafismo foi removido.
 */
export function PageHeader({
  eyebrow,
  title,
  titleInfo,
  community,
  action,
  children,
}: PageHeaderProps) {
  const tekoinBalance = useTekoinBalance()

  return (
    <header className="relative overflow-hidden rounded-b-2xl bg-terra px-4 pb-7 pt-5 text-creme">
      <div className="absolute right-3 top-4 z-10 flex items-center gap-2">
        {action}
        <Link
          href="/perfil/tekoins"
          aria-label={`Saldo de ${tekoinBalance} Tekoins`}
          className="flex shrink-0 items-center gap-1 rounded-full bg-creme/15 px-2.5 py-1.5 font-strong text-[12px] font-bold text-creme transition-colors hover:bg-creme/25"
        >
          <Icon name="coin" size={14} />
          {tekoinBalance}
        </Link>
      </div>
      <div className="relative">
        {eyebrow && (
          <p className="font-body text-[11px] text-creme/70">{eyebrow}</p>
        )}
        <div className="flex items-center gap-1">
          <h1 className="font-display text-[22px] font-extrabold leading-tight">
            {title}
          </h1>
          {titleInfo}
        </div>
        {community && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-creme/30 bg-creme/15 px-2.5 py-1 font-body text-[11px]">
            <Icon name="map-pin" size={12} />
            {community}
          </span>
        )}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </header>
  )
}
