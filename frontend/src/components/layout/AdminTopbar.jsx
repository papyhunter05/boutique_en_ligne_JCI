import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import LogoutConfirmDialog from '../auth/LogoutConfirmDialog'
import { findNavItem } from '../../app/adminNav'
import { useAuth } from '../../hooks/useAuth'
import { IconBuildingStore, IconLogout, IconMenu2 } from '../ui/tablerIcons'
import styles from './AdminTopbar.module.css'

export default function AdminTopbar({ menuOpen, onMenuToggle }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [logoutOpen, setLogoutOpen] = useState(false)

  const current = findNavItem(pathname)

  return (
    <header className={styles.topbar}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={onMenuToggle}
        aria-label="Ouvrir le menu"
        aria-expanded={menuOpen}
        aria-controls="admin-sidebar"
      >
        <IconMenu2 size={22} />
      </button>

      <nav aria-label="Fil d'Ariane" className={styles.breadcrumb}>
        <ol>
          <li>
            <Link to="/admin">Administration</Link>
          </li>
          {current && (
            <li aria-current="page">
              <span aria-hidden="true">›</span> {current.label}
            </li>
          )}
        </ol>
      </nav>

      <div className={styles.actions}>
        <span className={styles.name} title={`${user.prenom} ${user.nom}`}>
          {user.prenom} {user.nom}
        </span>

        <Link
          to="/"
          className={styles.iconButton}
          aria-label="Retour à la boutique"
          title="Retour à la boutique"
        >
          <IconBuildingStore size={20} />
        </Link>

        <button
          type="button"
          className={styles.iconButton}
          onClick={() => setLogoutOpen(true)}
          aria-label="Se déconnecter"
          title="Se déconnecter"
        >
          <IconLogout size={20} />
        </button>
      </div>

      <LogoutConfirmDialog isOpen={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </header>
  )
}