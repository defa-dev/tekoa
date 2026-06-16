'use client'

import { usePathname } from 'next/navigation'

/**
 * Linha de colunas (trilho esq | centro | trilho dir) no desktop.
 *
 * O topo dos cards do feed começa em alturas diferentes em cada tela (Trocas
 * tem um rótulo, Feira tem busca + categorias, Avisos tem filtros). Para os
 * trilhos (mapa e conversas) alinharem com os cards, definimos o offset por
 * rota numa variável CSS `--rail-top`, que os trilhos consomem.
 */
function railTopFor(pathname: string): number {
  if (pathname.startsWith('/feira')) return 184
  if (pathname.startsWith('/avisos')) return 130
  if (pathname.startsWith('/trocas')) return 104
  // Telas com cabeçalho terra (mais alto): alinha logo abaixo dele.
  if (pathname.startsWith('/dashboard')) return 144
  if (pathname.startsWith('/perfil')) return 186
  return 104
}

export function RailRow({
  left,
  right,
  children,
}: {
  left: React.ReactNode
  right: React.ReactNode
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div
      className="relative z-10 flex min-w-0 flex-1 justify-center"
      style={{ ['--rail-top' as string]: `${railTopFor(pathname)}px` }}
    >
      {left}
      {children}
      {right}
    </div>
  )
}
