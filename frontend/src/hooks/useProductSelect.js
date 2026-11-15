import { useAuth } from './useAuth'
import { useAuthModal } from './useAuthModal'

// Retourne la fonction à appeler au clic sur un produit, ou undefined s'il n'y a rien à faire.
// Visiteur : la connexion est requise. Connecté : la page détail n'existe pas encore.
export function useProductSelect() {
  const { isAuthenticated } = useAuth()
  const { openLogin } = useAuthModal()
  return isAuthenticated ? undefined : openLogin
}