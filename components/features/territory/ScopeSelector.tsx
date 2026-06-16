'use client'

import { REACH_OPTIONS, type Reach } from '@/lib/territories'
import { cn } from '@/lib/utils'

interface ScopeSelectorProps {
  reach: Reach
  onReachChange: (reach: Reach) => void
  selected: string[]
  onSelectedChange: (selected: string[]) => void
  /** Nomes de todas as comunidades cadastradas. */
  communities: string[]
  /** Comunidade do autor (não aparece na lista de "outras"). */
  userCommunity?: string | null
}

/**
 * Escolhe o alcance territorial de uma publicação: só na quebrada, em
 * territórios escolhidos, ou em todos.
 */
export function ScopeSelector({
  reach,
  onReachChange,
  selected,
  onSelectedChange,
  communities,
  userCommunity,
}: ScopeSelectorProps) {
  const others = communities.filter((c) => c !== userCommunity)

  function toggle(name: string) {
    onSelectedChange(
      selected.includes(name)
        ? selected.filter((s) => s !== name)
        : [...selected, name]
    )
  }

  return (
    <div>
      <p className="mb-1.5 font-body text-[10px] font-medium uppercase tracking-[0.07em] text-tinta-mid">
        Onde isso aparece?
      </p>

      {!userCommunity && (
        <p className="mb-2 font-body text-[12px] text-tinta-mid">
          Defina sua comunidade no perfil para limitar a publicação ao seu
          território.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {REACH_OPTIONS.map((opt) => {
          const active = reach === opt.value
          const disabled = opt.value !== 'all' && !userCommunity
          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => onReachChange(opt.value)}
              className={cn(
                'rounded-lg border p-3 text-left transition-colors',
                active
                  ? 'border-terra border-[1.5px] bg-terra-light'
                  : 'border-palha bg-creme-dark hover:border-ouro',
                disabled && 'cursor-not-allowed opacity-40'
              )}
            >
              <span className="block font-strong text-[13px] font-bold text-tinta">
                {opt.label}
              </span>
              <span className="block font-body text-[12px] text-tinta-mid">
                {opt.hint}
              </span>
            </button>
          )
        })}
      </div>

      {reach === 'selected' && (
        <div className="mt-3">
          <p className="mb-1.5 font-body text-[10px] font-medium uppercase tracking-[0.07em] text-tinta-mid">
            Quais territórios?
          </p>
          {others.length === 0 ? (
            <p className="font-body text-[12px] text-tinta-mid">
              Nenhum outro território cadastrado ainda.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {others.map((c) => {
                const on = selected.includes(c)
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggle(c)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 font-body text-[13px] transition-colors',
                      on
                        ? 'border-terra bg-terra text-creme'
                        : 'border-palha bg-creme-dark text-tinta-mid hover:border-ouro'
                    )}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
