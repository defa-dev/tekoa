'use client'

import { useState } from 'react'
import { signOut } from '@/app/auth/actions'
import { Icon } from '@/components/icons/Icon'

/**
 * Botão de sair. A própria server action redireciona para /login.
 */
export function LogoutButton() {
  const [loading, setLoading] = useState(false)

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true)
        await signOut()
      }}
      className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left font-body text-sm text-erro transition-colors hover:bg-erro-light disabled:opacity-50"
    >
      <Icon name="logout" size={20} />
      {loading ? 'Saindo...' : 'Sair'}
    </button>
  )
}
