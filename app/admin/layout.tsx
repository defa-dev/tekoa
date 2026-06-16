import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentProfile } from '@/lib/auth/session'
import { Icon } from '@/components/icons/Icon'

export const dynamic = 'force-dynamic'

/**
 * Área administrativa. Só acessível a usuários com is_admin.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')
  if (!profile.is_admin) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-creme">
      <header className="bg-tinta text-creme">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            href="/dashboard"
            aria-label="Voltar ao app"
            className="-ml-1 flex h-9 w-9 items-center justify-center rounded-md hover:bg-creme/15"
          >
            <Icon name="arrow-left" size={20} />
          </Link>
          <Icon name="shield" size={18} />
          <h1 className="font-display text-[18px] font-bold">Administração</h1>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  )
}
