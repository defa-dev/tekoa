import type { SVGProps } from 'react'

interface MosaicPatternProps extends SVGProps<SVGSVGElement> {
  /** Cor do mosaico (currentColor por padrão) */
  color?: string
  opacity?: number
  size?: number
}

/**
 * Padrão de mosaico — elemento de assinatura da identidade Tekoa.
 * Inspirado em padrões geométricos afro-brasileiros e azulejos de feira.
 * Usado como fundo sutil em headers e na splash. Nunca em foreground.
 */
export function MosaicPattern({
  color = 'currentColor',
  opacity = 0.12,
  size = 80,
  ...props
}: MosaicPatternProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <g fill={color} opacity={opacity}>
        <rect x="0" y="0" width="20" height="20" />
        <rect x="40" y="0" width="20" height="20" />
        <rect x="20" y="20" width="20" height="20" />
        <rect x="60" y="20" width="20" height="20" />
        <rect x="0" y="40" width="20" height="20" />
        <rect x="40" y="40" width="20" height="20" />
        <rect x="20" y="60" width="20" height="20" />
        <rect x="60" y="60" width="20" height="20" />
      </g>
    </svg>
  )
}
