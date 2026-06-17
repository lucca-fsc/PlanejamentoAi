import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'

import { RootLayout } from './RootLayout'

export function ProtectedLayout() {
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <p className="text-sm text-muted-foreground">Verificando sessao...</p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <RootLayout />
}
