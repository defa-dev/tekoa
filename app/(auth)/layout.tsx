import Link from 'next/link'
import { Frieze } from '@/components/graphics/Frieze'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[100svh] flex-col bg-creme">
      {/* faixa kusiwa no topo — territorialidade desde a entrada */}
      <div className="bg-tinta px-6 pb-3 pt-5">
        <Link
          href="/"
          className="mx-auto flex w-full max-w-[480px] items-center"
          aria-label="Tekoa — início"
        >
          <span className="font-title-inline text-[24px] tracking-wide text-creme">
            tekoa
          </span>
        </Link>
      </div>
      <Frieze src="/images/caninana.png" tone="terra" height={34} opacity={0.95} />

      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-6 py-8">
        {children}
      </div>
    </div>
  )
}
