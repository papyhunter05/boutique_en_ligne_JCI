import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import {
  IconBuildingWarehouse,
  IconMinus,
  IconPackage,
  IconPlus,
  IconShoppingCart,
} from '../../components/ui/tablerIcons'
import StatCard from '../../components/admin/StatCard'
import MouvementsTable from '../../components/admin/MouvementsTable'
import StateMessage from '../../components/common/StateMessage'
import Pagination from '../../components/common/Pagination'
import MouvementFormModal from './MouvementFormModal'
import { useMouvementsVariante } from '../../hooks/useAdminStock'
import { formatVariante } from '../../utils/format'
import styles from './VarianteStockPage.module.css'

export default function VarianteStockPage() {
  const { idVariante } = useParams()
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const { data, isPending, isError, error, isFetching, refetch } = useMouvementsVariante(
    idVariante,
    page,
  )

  const [formState, setFormState] = useState({ open: false, mode: 'entree' })
  const openForm = (mode) => setFormState({ open: true, mode })
  const closeForm = () => setFormState((state) => ({ ...state, open: false }))

  function handlePageChange(newPage) {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const backLink = (
    <Link to="/admin/stock" className={styles.back}>
      ← Retour à l'historique du stock
    </Link>
  )

  if (isError && !data) {
    const notFound = error?.response?.status === 404
    return (
      <div className={styles.page}>
        <section className={styles.card}>
          {backLink}
          <StateMessage
            isError
            title={notFound ? 'Variante introuvable.' : "Impossible de charger l'historique."}
            message={
              notFound
                ? "Cette variante n'existe pas ou a été supprimée."
                : 'Vérifiez votre connexion puis réessayez.'
            }
            actionLabel={notFound ? "Retour à l'historique" : 'Réessayer'}
            onAction={notFound ? () => navigate('/admin/stock') : () => refetch()}
          />
        </section>
      </div>
    )
  }

  const variante = data?.variante

  // La variante est imposée au formulaire : pas de sélecteurs
  const fixedVariante = data && {
    id_variante: variante.id_variante,
    produit: data.produit,
    modele: variante.modele,
    taille: variante.taille,
    sku: variante.sku,
    stock_disponible: variante.stock_disponible,
  }

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        {backLink}

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Stock de la variante</h1>
            {data && (
              <p className={styles.subtitle}>
                {data.produit} · {formatVariante(variante)} · SKU {variante.sku}
              </p>
            )}
          </div>

          <div className={styles.buttons}>
            <Button
              variant="dark"
              leftIcon={<IconPlus size={18} />}
              onClick={() => openForm('entree')}
              disabled={!data}
            >
              Réapprovisionner
            </Button>
            <Button
              variant="soft"
              leftIcon={<IconMinus size={18} />}
              onClick={() => openForm('sortie')}
              disabled={!data}
            >
              Sortie manuelle
            </Button>
          </div>
        </header>

        <section className={styles.stats} aria-label="Niveaux de stock">
          <StatCard
            label="Stock total"
            value={variante?.quantite_stock}
            hint="Unités en stock"
            icon={IconBuildingWarehouse}
            iconColor="var(--color-blue)"
            isLoading={isPending}
          />
          <StatCard
            label="Stock réservé"
            value={variante?.quantite_reservee}
            hint="Unités réservées"
            icon={IconShoppingCart}
            iconColor="var(--color-yellow)"
            isLoading={isPending}
          />
          <StatCard
            label="Stock disponible"
            value={variante?.stock_disponible}
            hint="Total moins réservé"
            icon={IconPackage}
            iconColor="var(--color-green)"
            isLoading={isPending}
          />
        </section>

        <h2 className={styles.sectionTitle}>Historique des mouvements</h2>

        {isPending ? (
          <span className={styles.skeleton} aria-busy="true" />
        ) : data.items.length === 0 ? (
          <StateMessage
            title="Aucun mouvement pour cette variante."
            message="Les entrées et sorties de stock apparaîtront ici."
          />
        ) : (
          <>
            <div className={isFetching ? styles.fetching : undefined} aria-busy={isFetching}>
              <MouvementsTable rows={data.items} />
            </div>
            <Pagination
              page={page}
              lastPage={data.pagination.lastPage}
              onChange={handlePageChange}
              disabled={isFetching}
              label="Pagination de l'historique"
            />
          </>
        )}
      </section>

      {fixedVariante && (
        <MouvementFormModal
          isOpen={formState.open}
          mode={formState.mode}
          fixedVariante={fixedVariante}
          onClose={closeForm}
        />
      )}
    </div>
  )
}