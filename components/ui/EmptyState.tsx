import { Icon, type IconName } from '@/components/icons/Icon'

export interface EmptyStateProps {
  icon?: IconName
  title: string
  description?: string
  children?: React.ReactNode
}

/**
 * Estado vazio afetivo — convida à ação em vez de só informar a ausência.
 */
export function EmptyState({
  icon = 'leaf',
  title,
  description,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-terra-light text-terra">
        <Icon name={icon} size={28} />
      </span>
      <h3 className="font-display text-[17px] font-bold text-tinta">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs font-body text-[13px] text-tinta-mid">
          {description}
        </p>
      )}
      {children && <div className="mt-5">{children}</div>}
    </div>
  )
}
