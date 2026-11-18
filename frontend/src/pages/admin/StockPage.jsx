import { useState } from 'react'
import Button from '../../components/ui/Button'
import { IconMinus, IconPlus } from '../../components/ui/tablerIcons'
import MouvementsTable from '../../components/admin/MouvementsTable'
import MouvementFilters from '../../components/admin/MouvementFilters'
import StateMessage from '../../components/common/StateMessage'
import Pagination from '../../components/common/Pagination'
import MouvementFormModal from './MouvementFormModal'
import { useAllMouvements } from '../../hooks/useAdminStock'
import { useMouvementFilters } from '../../hooks/useMouvementFilters'
import { usePaged } from '../../hooks/usePaged'
import { formatResultCount, pluralize } from '../../utils/format'
import styles from './StockPage.module.css'

const EMPTY = []
const PAGE_SIZE = 15

export default function StockPage() {
  const { data, isPending, isError, isFetching, refetch } = useAllMouvements()
  const items = data?.items ?? EMPTY

  const filterState = useMouvementFilters(items)
  const { filtered, reset } = filterState

  const { page, lastPage, pageItems, setPage } = usePaged(
    filtered,
    PAGE_SIZE,
    JSON.stringify(filterState.filters),
  )

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

    if (items.length === 0) {
      return (
        <StateMessage
          title="Aucun mouvement de stock pour le moment."
          message="Les mouvements apparaissent après un réapprovisionnement ou une sortie."
        />
      )
    }

    return (
      <>
        {data.truncated && (
          <p className={styles.notice} role="status">
            Seuls les {items.length} mouvements les plus récents (sur {data.total}) sont chargés
            et filtrés.
          </p>
        )}

        <MouvementFilters
          state={filterState}
          searchPlaceholder="Produit, SKU, motif, administrateur…"
          summary={formatResultCount(filtered.length, items.length)}
        />

        {filtered.length === 0 ? (
          <StateMessage
            title="Aucun mouvement ne correspond."
            message="Modifiez ou réinitialisez les filtres."
            actionLabel="Réinitialiser les filtres"
            onAction={reset}
          />
        ) : (
          <>
            <div className={isFetching ? styles.fetching : undefined} aria-busy={isFetching}>
              <MouvementsTable rows={pageItems} showProduct />
            </div>
            <Pagination
              page={page}
              lastPage={lastPage}
              onChange={handlePageChange}
              label="Pagination de l'historique"
            />
          </>
        )}
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
                ? `${pluralize(data.total, 'mouvement')} enregistré${data.total > 1 ? 's' : ''}`
                : 'Historique de tous les mouvements de stock.'}
            </p>
          </div>

          <div className={styles.buttons}>
            <Button
              variant="dark"
              leftIcon={<IconPlus size={18} />}
              onClick={() => openForm('entree')}
            >
              Réapprovisionner
            </Button>
            <Button
              variant="soft"
              leftIcon={<IconMinus size={18} />}
              onClick={() => openForm('sortie')}
            >
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