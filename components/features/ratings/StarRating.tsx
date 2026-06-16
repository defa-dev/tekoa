'use client'

import { Icon } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  size?: number
  readOnly?: boolean
}

/**
 * Estrelas de avaliação (1..5). Interativa por padrão; readOnly para exibir.
 */
export function StarRating({
  value,
  onChange,
  size = 28,
  readOnly = false,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-1" role={readOnly ? 'img' : 'radiogroup'} aria-label={`${value} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= value
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
            onClick={() => onChange?.(n)}
            className={cn(
              'transition-transform',
              !readOnly && 'hover:scale-110 active:scale-95',
              readOnly && 'cursor-default'
            )}
          >
            <Icon
              name="star"
              size={size}
              className={active ? 'text-terra' : 'text-palha'}
              style={active ? { fill: 'currentColor' } : undefined}
            />
          </button>
        )
      })}
    </div>
  )
}
