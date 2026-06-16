import { Icon } from '@/components/icons/Icon'

export interface PageHeaderProps {
  /** Linha pequena acima do título (ex.: saudação) */
  eyebrow?: string
  title: string
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
  community,
  action,
  children,
}: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-b-2xl bg-terra px-4 pb-7 pt-5 text-creme">
      {action && <div className="absolute right-3 top-4 z-10">{action}</div>}
      <div className="relative">
        {eyebrow && (
          <p className="font-body text-[11px] text-creme/70">{eyebrow}</p>
        )}
        <h1 className="font-display text-[22px] font-extrabold leading-tight">
          {title}
        </h1>
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
