import { Icon } from '@/components/icons/Icon'

/**
 * Placeholder do painel direito quando nenhuma conversa está aberta (desktop).
 */
export function ChatEmpty() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-terra-light text-terra">
        <Icon name="message" size={28} />
      </span>
      <h2 className="font-display text-[18px] text-tinta">
        Escolha uma conversa
      </h2>
      <p className="mt-1 max-w-xs font-body text-[13px] text-tinta-mid">
        Selecione uma conversa à esquerda para continuar combinando a troca.
      </p>
    </div>
  )
}
