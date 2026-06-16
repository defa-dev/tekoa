import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth/session'
import { LoginForm } from '@/components/features/auth/LoginForm'

export default async function LoginPage() {
  const user = await getAuthUser()
  if (user) redirect('/dashboard')

  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
