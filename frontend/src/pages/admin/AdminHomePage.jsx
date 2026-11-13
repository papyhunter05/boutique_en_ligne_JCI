import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import LogoutConfirmDialog from '../../components/auth/LogoutConfirmDialog'

export default function AdminHomePage() {
  const { user } = useAuth()
  const [logoutOpen, setLogoutOpen] = useState(false)

  return (
    <main style={{ padding: 'var(--space-6)', display: 'grid', gap: 'var(--space-3)', justifyItems: 'start' }}>
      <h1>Espace administrateur</h1>
      <p>Bonjour {user.prenom} {user.nom}. Le tableau de bord sera construit à l'étape suivante.</p>
      <Link to="/" style={{ color: 'var(--color-blue)' }}>← Retour à la boutique</Link>
      <Button variant="soft" onClick={() => setLogoutOpen(true)}>Déconnexion</Button>

      <LogoutConfirmDialog isOpen={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </main>
  )
}