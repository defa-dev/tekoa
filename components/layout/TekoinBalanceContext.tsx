'use client'

import { createContext, useContext } from 'react'

const TekoinBalanceContext = createContext(0)

/**
 * Saldo de Tekoins do usuário, buscado uma vez no layout autenticado e
 * disponibilizado por contexto pro `TopBar` — evita repetir o fetch em
 * cada uma das páginas que montam a barra de título.
 */
export function TekoinBalanceProvider({
  value,
  children,
}: {
  value: number
  children: React.ReactNode
}) {
  return (
    <TekoinBalanceContext.Provider value={value}>
      {children}
    </TekoinBalanceContext.Provider>
  )
}

export function useTekoinBalance(): number {
  return useContext(TekoinBalanceContext)
}
