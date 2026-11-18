import { useEffect, useRef } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import StateMessage from './StateMessage'
import { useAuth } from '../../hooks/useAuth'
import { useAuthModal } from '../../hooks/useAuthModal'

export default function RequireClient() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isLoading, isAuthenticated, isClient, sessionError, retrySession } = useAuth()
  const { openLogin } = useAuthModal()

  // Se souvient qu'une personne était connectée : à sa déconnexion, on ne rouvre pas la modale
  const wasAuthenticated = useRef(false)
  useEffect(() => {
    if (isAuthenticated) wasAuthenticated.current = true
  }, [isAuthenticated])

  // Visiteur arrivé directement sur la page : connexion, puis retour ici
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !sessionError && !wasAuthenticated.current) {
      openLogin({ onSuccess: () => navigate(pathname) })
    }
  }, [isLoading, isAuthenticated, sessionError, openLogin, navigate, pathname])

  if (isLoading) return <p style={{ padding: 24 }}>Chargement...</p>

  if (sessionError) {
    return (
      <StateMessage
        isError
        title="Impossible de vérifier votre session."
        message="Le serveur ne répond pas. Vérifiez votre connexion puis réessayez."
        actionLabel="Réessayer"
        onAction={retrySession}
      />
    )
  }

  if (!isAuthenticated || !isClient) return <Navigate to="/" replace />

  return <Outlet />
}