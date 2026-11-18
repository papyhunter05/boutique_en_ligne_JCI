import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../common/Logo'
import Button from '../ui/Button'
import { HomeIcon, CartIcon } from '../ui/icons'
import LogoutConfirmDialog from '../auth/LogoutConfirmDialog'
import { useAuth } from '../../hooks/useAuth'
import { useAuthModal } from '../../hooks/useAuthModal'
import { usePanier } from '../../hooks/usePanier'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import { pluralize } from '../../utils/format'
import styles from './Header.module.css'

export default function Header() {
  const headerRef = useRef(null)
  useScrollProgress(headerRef)

  const { isLoading, isAuthenticated, isAdmin, isClient, sessionError, retrySession } = useAuth()
  const { openLogin } = useAuthModal()
  const [logoutOpen, setLogoutOpen] = useState(false)

  // Nombre de lignes du panier (comme « nombre_articles » du backend). Rien si indisponible.
  const { data: panier } = usePanier()
  const cartCount = panier?.nombre_articles ?? 0

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
                  {isClient && (
                    <Button
                      as={Link}
                      to="/panier"
                      variant="slate"
                      size="sm"
                      leftIcon={<CartIcon size={16} />}
                      aria-label={cartCount > 0 ? `Panier, ${pluralize(cartCount, 'article')}` : 'Panier'}
                    >
                      Panier
                      {cartCount > 0 && <span className={styles.cartCount}> {cartCount}</span>}
                    </Button>
                  )}
                  <Button variant="soft" size="sm" onClick={() => setLogoutOpen(true)}>
                    Déconnexion
                  </Button>
                </>
              ) : sessionError ? (
                <Button variant="soft" size="sm" onClick={retrySession}>
                  Session non vérifiée · Réessayer
                </Button>
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