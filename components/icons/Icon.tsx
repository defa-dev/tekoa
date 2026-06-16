import type { SVGProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Conjunto de ícones desenhados inline (estilo outline, 24x24, currentColor).
 *
 * Optamos por SVG próprio em vez de webfont via CDN: menos dependência de
 * terceiros, funciona offline e mantém o território do código sob controle.
 */
export const ICON_PATHS = {
  home: (
    <path d="M5 12l-2 0l9 -9l9 9l-2 0M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7M9 21v-6h6v6" />
  ),
  exchange: (
    <>
      <path d="M3 8h14l-3 -3M17 16h-14l3 3" />
    </>
  ),
  bag: (
    <>
      <path d="M6 7h12l1 13a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1z" />
      <path d="M9 11v-3a3 3 0 0 1 6 0v3" />
    </>
  ),
  speakerphone: (
    <>
      <path d="M18 8a3 3 0 0 1 0 6" />
      <path d="M10 8v11a1 1 0 0 1 -1 1h-1a1 1 0 0 1 -1 -1v-5" />
      <path d="M12 8h0l4.524 -3.77a0.9 .9 0 0 1 1.476 .692v12.156a0.9 .9 0 0 1 -1.476 .692l-4.524 -3.77h-4a3 3 0 0 1 0 -6h4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6 -6h4a6 6 0 0 1 6 6v1" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  message: (
    <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-9l-5 4v-4h-1a2 2 0 0 1 -2 -2v-8a2 2 0 0 1 2 -2z" />
  ),
  star: (
    <path d="M12 3l3 6l6 .75l-4.5 4.5l1 6l-5.5 -3l-5.5 3l1 -6l-4.5 -4.5l6 -.75z" />
  ),
  'map-pin': (
    <>
      <path d="M12 21s-6 -5.5 -6 -10a6 6 0 0 1 12 0c0 4.5 -6 10 -6 10z" />
      <circle cx="12" cy="11" r="2.5" />
    </>
  ),
  settings: (
    <>
      <path d="M10.3 4.3a1.6 1.6 0 0 1 3.4 0a1.6 1.6 0 0 0 2.4 1a1.6 1.6 0 0 1 2.2 2.2a1.6 1.6 0 0 0 1 2.4a1.6 1.6 0 0 1 0 3.4a1.6 1.6 0 0 0 -1 2.4a1.6 1.6 0 0 1 -2.2 2.2a1.6 1.6 0 0 0 -2.4 1a1.6 1.6 0 0 1 -3.4 0a1.6 1.6 0 0 0 -2.4 -1a1.6 1.6 0 0 1 -2.2 -2.2a1.6 1.6 0 0 0 -1 -2.4a1.6 1.6 0 0 1 0 -3.4a1.6 1.6 0 0 0 1 -2.4a1.6 1.6 0 0 1 2.2 -2.2a1.6 1.6 0 0 0 2.4 -1z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3 -4.3" />
    </>
  ),
  check: <path d="M5 12l5 5l9 -10" />,
  heart: (
    <path d="M12 20l-1.5 -1.35c-5.4 -4.85 -8.5 -7.7 -8.5 -11.15a4.5 4.5 0 0 1 8 -2.8a4.5 4.5 0 0 1 8 2.8c0 3.45 -3.1 6.3 -8.5 11.15z" />
  ),
  camera: (
    <>
      <path d="M5 8h2l1.5 -2h7l1.5 2h2a1 1 0 0 1 1 1v9a1 1 0 0 1 -1 1h-15a1 1 0 0 1 -1 -1v-9a1 1 0 0 1 1 -1z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  'arrow-left': <path d="M19 12h-14M10 7l-5 5l5 5" />,
  send: <path d="M4 12l16 -7l-7 16l-2.5 -6.5z" />,
  x: <path d="M6 6l12 12M18 6l-12 12" />,
  'chevron-right': <path d="M9 6l6 6l-6 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  tool: (
    <path d="M7 10a3.5 3.5 0 0 1 -4.4 -4.4l2.4 2.4l2 -2l-2.4 -2.4a3.5 3.5 0 0 1 4.6 4.2l9 9a2 2 0 0 1 -2.8 2.8l-9 -9z" />
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M4 9h16M8 3v4M16 3v4" />
    </>
  ),
  leaf: (
    <path d="M5 19c8 0 14 -4 14 -13c-9 0 -14 3 -14 9a4 4 0 0 0 2 3.5M5 19c0 -4 2 -7 6 -8" />
  ),
  logout: (
    <path d="M14 8v-2a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2 -2v-2M9 12h12l-3 -3M21 12l-3 3" />
  ),
  shield: (
    <path d="M12 3l8 3v5c0 5 -3.5 8.5 -8 10c-4.5 -1.5 -8 -5 -8 -10v-5z" />
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </>
  ),
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12l2 2l4 -4" />
    </>
  ),
  'minus-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12h6" />
    </>
  ),
  'x-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
    </>
  ),
} as const

export type IconName = keyof typeof ICON_PATHS

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
}

export function Icon({ name, size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('shrink-0', className)}
      {...props}
    >
      {ICON_PATHS[name]}
    </svg>
  )
}
