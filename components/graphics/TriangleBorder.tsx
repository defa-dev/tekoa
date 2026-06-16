import type { SVGProps } from 'react'

interface TriangleBorderProps extends Omit<SVGProps<SVGSVGElement>, 'height'> {
  color?: string
  opacity?: number
  height?: number
}

/**
 * Borda de dente-de-serra — divisor reutilizável entre seções.
 * Série de triângulos alternados, evocando grafismos de cestaria e palha.
 */
export function TriangleBorder({
  color = '#c9a97a',
  opacity = 0.4,
  height = 8,
  ...props
}: TriangleBorderProps) {
  return (
    <svg
      width="100%"
      height={height}
      viewBox="0 0 120 8"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <g fill={color} opacity={opacity}>
        {Array.from({ length: 15 }).map((_, i) => (
          <polygon key={i} points={`${i * 8},8 ${i * 8 + 4},0 ${i * 8 + 8},8`} />
        ))}
      </g>
    </svg>
  )
}
