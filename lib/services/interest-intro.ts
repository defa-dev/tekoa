/** Serviço resumido para montar a mensagem de interesse. */
export interface OfferSummary {
  title: string
  type: 'offer' | 'request'
}

/**
 * Mensagem automática ao demonstrar interesse numa troca.
 * Se o vizinho tem ofertas ativas, lista o que pode trocar.
 */
export function buildInterestIntro(
  fromName: string,
  serviceTitle: string,
  myServices: OfferSummary[]
): string {
  const name = fromName.trim() || 'Um vizinho'
  const offers = myServices.filter((s) => s.type === 'offer')

  if (offers.length === 0) {
    return `Oi! ${name} tem interesse em "${serviceTitle}".`
  }

  if (offers.length === 1) {
    return `Oi! ${name} tem interesse em "${serviceTitle}" e pode oferecer: ${offers[0].title}.`
  }

  const list = offers.map((s) => `• ${s.title}`).join('\n')
  return `Oi! ${name} tem interesse em "${serviceTitle}" e pode oferecer:\n${list}`
}
