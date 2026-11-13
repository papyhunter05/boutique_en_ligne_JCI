import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../common/Logo'
import Button from '../ui/Button'
import { HomeIcon, CartIcon } from '../ui/icons'
import LogoutConfirmDialog from '../auth/LogoutConfirmDialog'
import { useAuth } from '../../hooks/useAuth'
import { useAuthModal } from '../../hooks/useAuthModal'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import styles from './Header.module.css'

export default function Header() {
  const headerRef = useRef(null)
  useScrollProgress(headerRef)

  const { isLoading, isAuthenticated, isAdmin } = useAuth()
  const { openLogin } = useAuthModal()
  const [logoutOpen, setLogoutOpen] = useState(false)

  return (
    <>
      <header ref={headerRef} className={styles.header}>
        <div className={styles.inner}>
          <Link to="/" aria-label="JCI Madagascar, retour à l'accueil">
            <Logo />
          </Link>

          <nav className={styles.nav} aria-label="Navigation principale">
            <Button as={Link} to="/" variant="slate" size="sm" leftIcon={<HomeIcon size={16} />}>
              Accueil
            </Button>

            {/* Rien n'est affiché tant que la session n'est pas vérifiée */}
            {!isLoading &&
              (isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Button as={Link} to="/admin" variant="slate" size="sm">
                      Administration
                    </Button>
                  )}
                  {/* Le panier sera branché dans un module ultérieur */}
                  <Button
                    variant="slate"
                    size="sm"
                    leftIcon={<CartIcon size={16} />}
                    disabled
                    title="Bientôt disponible"
                  >
                    Panier
                  </Button>
                  <Button variant="soft" size="sm" onClick={() => setLogoutOpen(true)}>
                    Déconnexion
                  </Button>
                </>
              ) : (
                <Button variant="slate" size="sm" onClick={openLogin}>
                  Connexion
                </Button>
              ))}
          </nav>
        </div>
      </header>

      {/* Hors du <header> : il doit rester monté même quand le bouton disparaît */}
      <LogoutConfirmDialog isOpen={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </>
  )
}