import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import StateMessage from './StateMessage'
import { useAuth } from '../../hooks/useAuth'
import { useAuthModal } from '../../hooks/useAuthModal'

export default function RequireAdmin() {
  const { isLoading, isAuthenticated, isAdmin, sessionError, retrySession } = useAuth()
  const { openLogin } = useAuthModal()

  // Visiteur non connecté : on le renvoie à la boutique avec la modale ouverte.
  // Pas si la session n'a simplement pas pu être vérifiée (serveur injoignable).
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !sessionError) openLogin()
  }, [isLoading, isAuthenticated, sessionError, openLogin])

  if (isLoading) return <p style={{ padding: 24 }}>Chargement...</p>

  if (sessionError) {
    return (
      <div style={{ padding: 'var(--space-6)' }}>
        <StateMessage
          isError
          title="Impossible de vérifier votre session."
          message="Le serveur ne répond pas. Vérifiez votre connexion puis réessayez."
          actionLabel="Réessayer"
          onAction={retrySession}
        />
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />

  return <Outlet />
}