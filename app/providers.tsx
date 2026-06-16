'use client'

import { ToastProvider } from '@/components/ui/Toast'

/**
 * Providers globais do lado do cliente (contexts).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}
