import { cn } from '@/lib/utils'

type Tone = 'ink' | 'cream' | 'terra' | 'ouro'

interface FriezeProps {
  /** Grafismo a usar (faixa horizontal). */
  src?: string
  /** Cor: ink mantém o preto; cream/terra/ouro recolorem via filtro. */
  tone?: Tone
  height?: number
  opacity?: number
  className?: string
  flip?: boolean
}

// Filtros aproximados para recolorir um friso preto.
const TONE_FILTER: Record<Tone, string> = {
  ink: 'none',
  cream: 'invert(96%) sepia(8%) saturate(360%) hue-rotate(350deg) brightness(102%)',
  terra:
    'invert(28%) sepia(64%) saturate(2200%) hue-rotate(332deg) brightness(86%)',
  ouro: 'invert(72%) sepia(22%) saturate(560%) hue-rotate(353deg) brightness(94%)',
}

/**
 * Friso decorativo a partir dos grafismos kusiwa reais (caninana, jabuti...).
 * Usado como divisor entre seções e borda de cabeçalhos.
 */
export function Frieze({
  src = '/images/caninana.png',
  tone = 'ink',
  height = 22,
  opacity = 1,
  className,
  flip = false,
}: FriezeProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('w-full bg-repeat-x', className)}
      style={{
        height,
        opacity,
        backgroundImage: `url(${src})`,
        backgroundSize: 'auto 100%',
        filter: TONE_FILTER[tone] === 'none' ? undefined : TONE_FILTER[tone],
        transform: flip ? 'scaleY(-1)' : undefined,
      }}
    />
  )
}
