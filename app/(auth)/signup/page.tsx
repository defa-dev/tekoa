import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth/session'
import { SignupForm } from '@/components/features/auth/SignupForm'

export default async function SignupPage() {
  const user = await getAuthUser()
  if (user) redirect('/dashboard')

  return <SignupForm />
}
