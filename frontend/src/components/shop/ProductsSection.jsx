import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import { ArrowRightIcon } from '../ui/icons'
import StateMessage from '../common/StateMessage'
import Pagination from '../common/Pagination'
import ProductCard from './ProductCard'
import { useProduits } from '../../hooks/useProduits'
import { useProductSelect } from '../../hooks/useProductSelect'
import { useAuth } from '../../hooks/useAuth'
import { useAuthModal } from '../../hooks/useAuthModal'
import { useNotification } from '../../hooks/useNotification'
import styles from './ProductsSection.module.css'

const SKELETON_COUNT = 8

export default function ProductsSection() {
  const sectionRef = useRef(null)
  const [page, setPage] = useState(1)

  const navigate = useNavigate()
  const { data, isPending, isError, isFetching, refetch } = useProduits(page)
  const onSelect = useProductSelect()
  const { isAuthenticated, isClient } = useAuth()
  const { openLogin } = useAuthModal()
  const notify = useNotification()

  function handleOrderClick() {
    if (!isAuthenticated) {
      // Après la connexion, on ouvre directement le panier
      openLogin({ onSuccess: () => navigate('/panier') })
    } else if (isClient) {
      navigate('/panier')
    } else {
      notify.info('Les comptes administrateurs ne peuvent pas passer commande.')
    }
  }

  function handlePageChange(newPage) {
    setPage(newPage)
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function renderContent() {
    if (isPending) {
      return (
        <ul className={styles.grid} aria-busy="true" aria-label="Chargement des produits">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <li key={i} className={styles.skeleton} />
          ))}
        </ul>
      )
    }

    // L'erreur ne remplace la grille que s'il n'y a rien à montrer
    if (isError && !data) {
      return (
        <StateMessage
          isError
          title="Impossible de charger les produits."
          message="Vérifiez votre connexion puis réessayez."
          actionLabel="Réessayer"
          onAction={() => refetch()}
        />
      )
    }

    if (data.items.length === 0) {
      return (
        <StateMessage
          title="Aucun produit pour le moment."
          message="Revenez bientôt, la boutique se remplit."
        />
      )
    }

    return (
      <>
        <ul className={styles.grid} aria-busy={isFetching}>
          {data.items.map((product) => (
            <li key={product.id_produit} className={isFetching ? styles.fetching : undefined}>
              <ProductCard product={product} onSelect={onSelect} showAddToCart={isClient} />
            </li>
          ))}
        </ul>
        <Pagination
          page={page}
          lastPage={data.pagination.lastPage}
          onChange={handlePageChange}
          disabled={isFetching}
        />
      </>
    )
  }

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="produits-title">
      <header className={styles.header}>
        <h2 id="produits-title" className={styles.title}>
          DÉCOUVREZ NOS PRODUITS !
        </h2>
        <p className={styles.subtitle}>*En attente de la finalisation de notre boutique</p>
        <Button variant="soft" pill onClick={handleOrderClick}>
          Passez votre commande ici
          <span className={styles.arrow}>
            <ArrowRightIcon size={14} />
          </span>
        </Button>
      </header>

      {renderContent()}
    </section>
  )
}