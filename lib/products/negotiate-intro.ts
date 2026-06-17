/**
 * Mensagem automática ao abrir negociação de um produto na Feira do Rolo.
 * O título do produto vira um link markdown simples `[texto](url)`,
 * renderizado como hiperlink pelo ChatThread.
 */
export function buildNegotiateIntro(productTitle: string, productId: string): string {
  return `Gostaria de negociar [${productTitle}](/feira/${productId}).`
}
