import { cn } from '@/lib/utils'

type Tone = 'ink' | 'cream' | 'terra' | 'ouro'

const TONE_FILTER: Record<Tone, string | undefined> = {
  ink: undefined,
  cream: 'invert(96%) sepia(8%) saturate(360%) hue-rotate(350deg) brightness(102%)',
  terra: 'invert(28%) sepia(64%) saturate(2200%) hue-rotate(332deg) brightness(86%)',
  ouro: 'invert(72%) sepia(22%) saturate(560%) hue-rotate(353deg) brightness(94%)',
}

/**
 * Camada de textura com um grafismo kusiwa tileado. Fica atrás do conteúdo
 * (fixed, baixa opacidade) para manter a identidade viva nas telas internas.
 */
export function GraphicTexture({
  src = '/images/caninana.png',
  tone = 'ouro',
  opacity = 0.06,
  size = 240,
  fixed = true,
  className,
}: {
  src?: string
  tone?: Tone
  opacity?: number
  size?: number
  fixed?: boolean
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none',
        fixed ? 'fixed inset-0' : 'absolute inset-0',
        className
      )}
      style={{
        opacity,
        backgroundImage: `url(${src})`,
        backgroundSize: `${size}px`,
        filter: TONE_FILTER[tone],
      }}
    />
  )
}
