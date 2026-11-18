import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import {
  IconCategoryFilled,
  IconInfoCircleFilled,
  IconPencilFilled,
  IconPlus,
} from '../../components/ui/tablerIcons'
import DataTable from '../../components/admin/DataTable'
import FilterBar, { SearchFilter, SelectFilter } from '../../components/admin/FilterBar'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import StateMessage from '../../components/common/StateMessage'
import Pagination from '../../components/common/Pagination'
import ProductImage from '../../components/shop/ProductImage'
import ProduitFormModal from './ProduitFormModal'
import ProduitInfoModal from './ProduitInfoModal'
import { useAllProduits } from '../../hooks/useAllProduits'
import { useToggleProduitStatut } from '../../hooks/useAdminProduits'
import { useProduitsStock } from '../../hooks/useProduitsStock'
import { useFilters } from '../../hooks/useFilters'
import { usePaged } from '../../hooks/usePaged'
import { useNotification } from '../../hooks/useNotification'
import { getErrorMessage } from '../../utils/errors'
import { matchesSearch } from '../../utils/filters'
import { STATUT_OPTIONS, VARIANTES_OPTIONS } from '../../utils/filterOptions'
import { getStockLevel } from '../../utils/stock'
import { formatPrix, formatResultCount, pluralize } from '../../utils/format'
import styles from './ProduitsPage.module.css'

const EMPTY = []
const PAGE_SIZE = 15
const INITIAL_FILTERS = { search: '', categorie: '', statut: '', variantes: '' }

function StockCell({ stock }) {
  if (!stock || stock.status === 'loading') {
    return <span className={styles.stockSkeleton} aria-label="Chargement du stock" />
  }

  if (stock.status === 'error') {
    return (
      <span className={styles.stockError} title="Stock indisponible">
        —
      </span>
    )
  }

  // Pour baser l'état sur le stock disponible : remplacer stock.total par stock.disponible
  const quantity = stock.total
  const level = getStockLevel(quantity)

  return (
    <div className={styles.stock}>
      <strong>{quantity}</strong>
      <StatusBadge tone={level.tone}>{level.label}</StatusBadge>
    </div>
  )
}

export default function ProduitsPage() {
  const notify = useNotification()
  const location = useLocation()
  const navigate = useNavigate()

  const { data, isPending, isError, isFetching, refetch } = useAllProduits()
  const statutMutation = useToggleProduitStatut()

  // Plus récents d'abord, comme la liste du serveur
  const produits = useMemo(
    () =>
      [...(data ?? EMPTY)].sort(
        (a, b) =>
          new Date(b.date_creation) - new Date(a.date_creation) || b.id_produit - a.id_produit,
      ),
    [data],
  )

  const { filters, setFilter, reset, hasActive } = useFilters(INITIAL_FILTERS)

  const categorieOptions = useMemo(() => {
    const byId = new Map()
    produits.forEach((p) => {
      if (p.categorie) byId.set(p.categorie.id_categorie, p.categorie.nom_categorie)
    })
    return [...byId]
      .map(([value, label]) => ({ value: String(value), label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'fr'))
  }, [produits])

  const filtered = useMemo(
    () =>
      produits.filter(
        (p) =>
          matchesSearch(filters.search, [p.nom_produit, p.description, p.categorie?.nom_categorie]) &&
          (!filters.categorie || String(p.id_categorie) === filters.categorie) &&
          (!filters.statut || p.statut === filters.statut) &&
          (!filters.variantes ||
            (filters.variantes === 'avec' ? p.variantes_count > 0 : !(p.variantes_count > 0))),
      ),
    [produits, filters],
  )

  const { page, lastPage, pageItems, setPage } = usePaged(
    filtered,
    PAGE_SIZE,
    JSON.stringify(filters),
  )

  // Stock des produits de la page affichée uniquement
  const stocks = useProduitsStock(pageItems.map((p) => p.id_produit))
  const stockById = useMemo(
    () => new Map(pageItems.map((p, index) => [p.id_produit, stocks[index]])),
    [pageItems, stocks],
  )

  // Le produit ciblé est conservé après la fermeture des modales :
  // leur contenu ne doit pas changer pendant l'animation de sortie.
  const [formState, setFormState] = useState(() => ({
    open: Boolean(location.state?.openCreate), // arrivée depuis « Ajouter un produit » du tableau de bord
    produit: null,
  }))
  const [infoState, setInfoState] = useState({ open: false, produit: null })
  const [toggle, setToggle] = useState({ open: false, produit: null })

  // Évite de rouvrir le formulaire au rechargement de la page
  useEffect(() => {
    if (location.state?.openCreate) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.state, location.pathname, navigate])

  const openCreate = () => setFormState({ open: true, produit: null })
  const openEdit = (produit) => setFormState({ open: true, produit })
  const closeForm = () => setFormState((state) => ({ ...state, open: false }))
  const openInfo = (produit) => setInfoState({ open: true, produit })
  const closeInfo = () => setInfoState((state) => ({ ...state, open: false }))
  const closeToggle = () => setToggle((state) => ({ ...state, open: false }))

  async function changeStatut(produit) {
    try {
      const result = await statutMutation.mutateAsync(produit.id_produit)
      // Le serveur bascule le statut : le message suit sa réponse, pas notre hypothèse
      const statut = result?.data?.statut
      const name = `« ${produit.nom_produit} »`
      if (statut === 'ACTIF') notify.success(`Produit ${name} activé.`)
      else if (statut === 'INACTIF') notify.success(`Produit ${name} désactivé.`)
      else notify.success(`Statut du produit ${name} modifié.`)
    } catch (error) {
      notify.error(getErrorMessage(error))
    }
  }

  function handleToggleClick(produit) {
    // Désactiver demande confirmation, activer est sans risque
    if (produit.statut === 'ACTIF') {
      setToggle({ open: true, produit })
    } else {
      changeStatut(produit)
    }
  }

  async function confirmDeactivation() {
    await changeStatut(toggle.produit)
    closeToggle()
  }

  function handlePageChange(newPage) {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const columns = [
    {
      key: 'produit',
      header: 'Produit',
      mobile: 'title',
      render: (p) => (
        <div className={styles.product}>
          <div className={styles.thumb}>
            <ProductImage src={p.image} />
          </div>
          <div className={styles.productText}>
            <strong className={styles.name}>{p.nom_produit}</strong>
            {/* Le contour rouge ne se voit pas avec un lecteur d'écran : on l'annonce */}
            {p.statut === 'INACTIF' && <span className="sr-only">Produit désactivé</span>}
            {p.description && <span className={styles.description}>{p.description}</span>}
          </div>
        </div>
      ),
    },
    { key: 'categorie', header: 'Catégorie', render: (p) => p.categorie?.nom_categorie ?? '—' },
    { key: 'prix', header: 'Prix', render: (p) => formatPrix(p.prix) },
    {
      key: 'variantes',
      header: 'Variantes',
      align: 'center',
      render: (p) =>
        p.variantes_count > 0 ? (
          p.variantes_count
        ) : (
          <StatusBadge tone="warning">Aucune</StatusBadge>
        ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (p) => <StockCell stock={stockById.get(p.id_produit)} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      mobile: 'actions',
      render: (p) => (
        <div className={styles.actions}>
          <Button
            variant="soft"
            size="sm"
            className={styles.iconAction}
            onClick={() => openInfo(p)}
            aria-label={`Informations sur ${p.nom_produit}`}
            title="Informations"
            leftIcon={<IconInfoCircleFilled size={18} aria-hidden="true" />}
          >
            <span className="sr-only">Informations</span>
          </Button>
          <Button
            as={Link}
            to={`/admin/produits/${p.id_produit}/variantes`}
            variant="soft"
            size="sm"
            className={styles.iconAction}
            aria-label={`Variantes de ${p.nom_produit}`}
            title="Variantes"
            leftIcon={<IconCategoryFilled size={18} aria-hidden="true" />}
          >
            <span className="sr-only">Variantes</span>
          </Button>
          <Button
            variant="soft"
            size="sm"
            className={styles.iconAction}
            onClick={() => openEdit(p)}
            aria-label={`Modifier ${p.nom_produit}`}
            title="Modifier"
            leftIcon={<IconPencilFilled size={18} aria-hidden="true" />}
          >
            <span className="sr-only">Modifier</span>
          </Button>
          <Button
            variant="soft"
            size="sm"
            className={styles.statusToggle}
            onClick={() => handleToggleClick(p)}
            disabled={statutMutation.isPending}
            role="switch"
            aria-checked={p.statut === 'ACTIF'}
            aria-label={`${p.statut === 'ACTIF' ? 'Désactiver' : 'Activer'} ${p.nom_produit}`}
            title={p.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}
            data-active={p.statut === 'ACTIF'}
          >
            <span className="sr-only">{p.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}</span>
          </Button>
        </div>
      ),
    },
  ]

  function renderContent() {
    if (isPending) {
      return (
        <div className={styles.skeletons} aria-busy="true" aria-label="Chargement des produits">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={styles.skeleton} />
          ))}
        </div>
      )
    }

    // L'erreur ne remplace le tableau que s'il n'y a rien à montrer
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

    if (produits.length === 0) {
      return (
        <StateMessage
          title="Aucun produit pour le moment."
          message="Ajoutez votre premier produit à la boutique."
          actionLabel="Ajouter un produit"
          onAction={openCreate}
        />
      )
    }

    return (
      <>
        <FilterBar
          hasActiveFilters={hasActive}
          onReset={reset}
          summary={formatResultCount(filtered.length, produits.length)}
        >
          <SearchFilter
            value={filters.search}
            onChange={(value) => setFilter('search', value)}
            placeholder="Nom, description, catégorie…"
          />
          <SelectFilter
            label="Catégorie"
            placeholder="Toutes les catégories"
            options={categorieOptions}
            value={filters.categorie}
            onChange={(value) => setFilter('categorie', value)}
          />
          <SelectFilter
            label="Statut"
            placeholder="Tous les statuts"
            options={STATUT_OPTIONS}
            value={filters.statut}
            onChange={(value) => setFilter('statut', value)}
          />
          <SelectFilter
            label="Variantes"
            placeholder="Toutes"
            options={VARIANTES_OPTIONS}
            value={filters.variantes}
            onChange={(value) => setFilter('variantes', value)}
          />
        </FilterBar>

        {filtered.length === 0 ? (
          <StateMessage
            title="Aucun produit ne correspond."
            message="Modifiez ou réinitialisez les filtres."
            actionLabel="Réinitialiser les filtres"
            onAction={reset}
          />
        ) : (
          <>
            <div className={isFetching ? styles.fetching : undefined} aria-busy={isFetching}>
              <DataTable
                caption="Liste des produits"
                columns={columns}
                rows={pageItems}
                rowKey={(p) => p.id_produit}
                rowTone={(p) => (p.statut === 'INACTIF' ? 'danger' : undefined)}
              />
            </div>
            <Pagination
              page={page}
              lastPage={lastPage}
              onChange={handlePageChange}
              label="Pagination des produits"
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
            <h1 className={styles.title}>Produits</h1>
            <p className={styles.subtitle}>
              {data
                ? `${pluralize(produits.length, 'produit')} au catalogue`
                : 'Gérez le catalogue de votre boutique.'}
            </p>
          </div>
          <Button variant="dark" leftIcon={<IconPlus size={18} />} onClick={openCreate}>
            Ajouter un produit
          </Button>
        </header>

        {renderContent()}
      </section>

      <ProduitFormModal isOpen={formState.open} produit={formState.produit} onClose={closeForm} />
      <ProduitInfoModal isOpen={infoState.open} produit={infoState.produit} onClose={closeInfo} />

      <ConfirmDialog
        isOpen={toggle.open}
        onClose={closeToggle}
        onConfirm={confirmDeactivation}
        loading={statutMutation.isPending}
        title="Désactiver le produit ?"
        message={`Le produit « ${toggle.produit?.nom_produit ?? ''} » ne sera plus visible par les clients dans la boutique. Vous pourrez le réactiver à tout moment.`}
        confirmLabel="Désactiver"
        confirmVariant="danger"
      />
    </div>
  )
}