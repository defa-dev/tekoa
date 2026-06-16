/**
 * Composições gráficas (grafismos editados, sufixo "-m") por tela.
 *
 * - `band`: fundo da faixa/cabeçalho (com scrim escuro por cima, texto claro).
 * - `pageBg`: textura de fundo da página inteira (baixa opacidade).
 *
 * Mantido em um só lugar para dar identidade própria a cada seção.
 */

const BANDS: Record<string, string> = {
  '/dashboard': 'samauma-m',
  '/trocas': 'samauma-m',
  '/feira': 'samauma-m',
  '/avisos': 'samauma-m',
  '/perfil': 'samauma-m',
  '/mensagens': 'samauma-m',
}

const PAGE_BGS: Record<string, string> = {
  '/dashboard': 'jabuti-m',
  '/trocas': 'caninana-m',
  '/feira': 'rio-m',
  '/avisos': 'samauma-m',
  '/perfil': 'jabuti-m',
  '/mensagens': 'caninana-m',
}

function pick(map: Record<string, string>, pathname: string, fallback: string): string {
  const key = Object.keys(map).find((k) => pathname.startsWith(k))
  return `/images/${(key ? map[key] : fallback)}.png`
}

export function bandGraphicFor(pathname: string): string {
  return pick(BANDS, pathname, 'caninana-m')
}

export function pageGraphicFor(pathname: string): string {
  return pick(PAGE_BGS, pathname, 'caninana-m')
}
