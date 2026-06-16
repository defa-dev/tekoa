'use client'

import { useRouter } from 'next/navigation'
import { Icon } from '@/components/icons/Icon'

export interface TopBarProps {
  title: string
  /** Mostra botão de voltar à esquerda */
  back?: boolean
  /** Elemento ao lado do título (ex.: ícone de informação) */
  titleInfo?: React.ReactNode
  /** Ação à direita (ex.: botão "+ Nova") */
  action?: React.ReactNode
}

/**
 * Barra de título das páginas internas. A faixa tem a largura dos cards do
 * feed. (Temporariamente em cor sólida — o fundo com grafismo foi removido.)
 */
export function TopBar({ title, back = false, titleInfo, action }: TopBarProps) {
  const router = useRouter()

  return (
    <div className="sticky top-0 z-30">
      <div className="relative mx-4 overflow-hidden rounded-lg bg-terra text-creme">
        <div className="relative flex items-center gap-2 px-3 py-3">
          {back && (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Voltar"
              className="-ml-1 flex h-9 w-9 items-center justify-center rounded-md text-creme hover:bg-creme/15"
            >
              <Icon name="arrow-left" size={20} />
            </button>
          )}
          <div className="flex flex-1 items-center gap-1">
            <h1 className="font-display text-[18px] font-bold text-creme">
              {title}
            </h1>
            {titleInfo}
          </div>
          {action}
        </div>
      </div>
    </div>
  )
}
