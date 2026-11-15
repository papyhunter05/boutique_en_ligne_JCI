import { useState } from 'react'
import Button from '../../components/ui/Button'
import { IconMinus, IconPlus } from '../../components/ui/tablerIcons'
import MouvementsTable from '../../components/admin/MouvementsTable'
import StateMessage from '../../components/common/StateMessage'
import Pagination from '../../components/common/Pagination'
import MouvementFormModal from './MouvementFormModal'
import { useMouvements } from '../../hooks/useAdminStock'
import styles from './StockPage.module.css'

export default function StockPage() {
  const [page, setPage] = useState(1)
  const { data, isPending, isError, isFetching, refetch } = useMouvements(page)

  // Le mode est conservé après la fermeture : le contenu ne change pas pendant l'animation de sortie
  const [formState, setFormState] = useState({ open: false, mode: 'entree' })
  const openForm = (mode) => setFormState({ open: true, mode })
  const closeForm = () => setFormState((state) => ({ ...state, open: false }))

  function handlePageChange(newPage) {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function renderContent() {
    if (isPending) {
      return (
        <div className={styles.skeletons} aria-busy="true" aria-label="Chargement de l'historique">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={styles.skeleton} />
          ))}
        </div>
      )
    }

    if (isError && !data) {
      return (
        <StateMessage
          isError
          title="Impossible de charger l'historique."
          message="Vérifiez votre connexion puis réessayez."
          actionLabel="Réessayer"
          onAction={() => refetch()}
        />
      )
    }

    if (data.items.length === 0) {
      return (
        <StateMessage
          title="Aucun mouvement de stock pour le moment."
          message="Les mouvements apparaissent après un réapprovisionnement ou une sortie."
        />
      )
    }

    return (
      <>
        <div className={isFetching ? styles.fetching : undefined} aria-busy={isFetching}>
          <MouvementsTable rows={data.items} showProduct />
        </div>
        <Pagination
          page={page}
          lastPage={data.pagination.lastPage}
          onChange={handlePageChange}
          disabled={isFetching}
          label="Pagination de l'historique"
        />
      </>
    )
  }

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Stock</h1>
            <p className={styles.subtitle}>
              {data
                ? `${data.pagination.total} mouvement${data.pagination.total > 1 ? 's' : ''} enregistré${data.pagination.total > 1 ? 's' : ''}`
                : 'Historique de tous les mouvements de stock.'}
            </p>
          </div>

          <div className={styles.buttons}>
            <Button variant="dark" leftIcon={<IconPlus size={18} />} onClick={() => openForm('entree')}>
              Réapprovisionner
            </Button>
            <Button variant="soft" leftIcon={<IconMinus size={18} />} onClick={() => openForm('sortie')}>
              Sortie manuelle
            </Button>
          </div>
        </header>

        {renderContent()}
      </section>

      <MouvementFormModal isOpen={formState.open} mode={formState.mode} onClose={closeForm} />
    </div>
  )
}