import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { ResetPasswordForm } from '@/components/features/auth/ResetPasswordForm'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams

  if (!code) {
    redirect('/login')
  }

  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
