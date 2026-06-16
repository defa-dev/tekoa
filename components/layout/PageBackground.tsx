'use client'

import { usePathname } from 'next/navigation'
import { pageGraphicFor } from '@/lib/screenGraphics'

/**
 * Textura de fundo da página inteira — uma composição de grafismo por seção,
 * em baixa opacidade para não competir com o conteúdo.
 */
export function PageBackground() {
  const pathname = usePathname()

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 opacity-[0.13]"
      style={{
        backgroundImage: `url(${pageGraphicFor(pathname)})`,
        backgroundSize: '300px',
      }}
    />
  )
}
