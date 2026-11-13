import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAuthModal } from '../../hooks/useAuthModal'

export default function RequireAdmin() {
  const { isLoading, isAuthenticated, isAdmin } = useAuth()
  const { openLogin } = useAuthModal()

  // Visiteur non connecté : on le renvoie à la boutique avec la modale ouverte
  useEffect(() => {
    if (!isLoading && !isAuthenticated) openLogin()
  }, [isLoading, isAuthenticated, openLogin])

  if (isLoading) return <p style={{ padding: 24 }}>Chargement...</p>
  if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />

  return <Outlet />
}