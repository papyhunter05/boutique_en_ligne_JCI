import { useState } from 'react'
import ConfirmDialog from '../common/ConfirmDialog'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'

// Utilisable partout où un bouton de déconnexion existe (navbar, espace admin...)
export default function LogoutConfirmDialog({ isOpen, onClose }) {
  const { logout } = useAuth()
  const notify = useNotification()
  const [isLoading, setIsLoading] = useState(false)

  async function handleConfirm() {
    setIsLoading(true)
    await logout()
    setIsLoading(false)
    onClose()
    notify.info('Vous avez été déconnecté.')
  }

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      loading={isLoading}
      title="Se déconnecter ?"
      message="Voulez-vous vraiment vous déconnecter de votre compte ?"
      confirmLabel="Se déconnecter"
    />
  )
}