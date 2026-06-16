/**
 * Grafismos da splash: grade diagonal de losangos (canto superior) e
 * constelação de territórios (rodapé). Evocam caminhos e confluência.
 */

export function DiagonalGrid({
  className,
  opacity = 0.12,
}: {
  className?: string
  opacity?: number
}) {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke="#c9a97a" strokeWidth="1" opacity={opacity}>
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`a${i}`} x1={i * 24} y1="0" x2="200" y2={200 - i * 24} />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`b${i}`} x1="0" y1={i * 24} x2={200 - i * 24} y2="200" />
        ))}
      </g>
    </svg>
  )
}

export function Constellation({
  className,
  opacity = 0.22,
}: {
  className?: string
  opacity?: number
}) {
  const points = [
    [10, 30],
    [55, 12],
    [95, 38],
    [140, 18],
    [185, 40],
    [230, 22],
  ]
  return (
    <svg
      width="100%"
      height="56"
      viewBox="0 0 240 56"
      fill="none"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke="#c9a97a" strokeWidth="1" opacity={opacity}>
        {points.slice(0, -1).map(([x, y], i) => {
          const [nx, ny] = points[i + 1]
          return <line key={i} x1={x} y1={y} x2={nx} y2={ny} />
        })}
      </g>
      <g fill="#c9a97a" opacity={opacity + 0.15}>
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 2 === 0 ? 3 : 2} />
        ))}
      </g>
    </svg>
  )
}
