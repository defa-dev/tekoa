import type { SVGProps } from 'react'

interface CommunityMarkerProps extends SVGProps<SVGSVGElement> {
  variant?: 'primary' | 'secondary'
  size?: number
}

/**
 * Marcador de comunidade — dois anéis concêntricos.
 * Usado no mapa e nos cards de seleção de bairro.
 */
export function CommunityMarker({
  variant = 'primary',
  size = 24,
  ...props
}: CommunityMarkerProps) {
  const color = variant === 'primary' ? '#b8342a' : '#4a6741'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="1.5" opacity="0.45" />
      <circle cx="12" cy="12" r="5" fill={color} />
    </svg>
  )
}
