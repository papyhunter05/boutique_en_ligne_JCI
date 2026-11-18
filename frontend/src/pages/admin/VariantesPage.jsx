import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import {
  IconBoxMultipleFilled,
  IconPencilFilled,
  IconPlus,
} from '../../components/ui/tablerIcons'
import DataTable from '../../components/admin/DataTable'
import StatutBadge from '../../components/admin/StatutBadge'
import FilterBar, { SearchFilter, SelectFilter } from '../../components/admin/FilterBar'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import StateMessage from '../../components/common/StateMessage'
import ProductImage from '../../components/shop/ProductImage'
import VarianteFormModal from './VarianteFormModal'
import { useToggleVarianteStatut, useVariantes } from '../../hooks/useAdminVariantes'
import { useFilters } from '../../hooks/useFilters'
import { useNotification } from '../../hooks/useNotification'
import { getErrorMessage } from '../../utils/errors'
import { matchesSearch } from '../../utils/filters'
import { STATUT_OPTIONS, STOCK_OPTIONS } from '../../utils/filterOptions'
import { formatPrix, formatResultCount } from '../../utils/format'
import styles from './VariantesPage.module.css'

const EMPTY = []
const INITIAL_FILTERS = { search: '', statut: '', stock: '' }

export default function VariantesPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const notify = useNotification()

  const { data, isPending, isError, error, refetch } = useVariantes(id)
  const statutMutation = useToggleVarianteStatut()
  const variantes = data?.variantes ?? EMPTY

  const { filters, setFilter, reset, hasActive } = useFilters(INITIAL_FILTERS)

  const filtered = useMemo(
    () =>
      variantes.filter(
        (v) =>
          matchesSearch(filters.search, [v.modele, v.taille, v.sku]) &&
          (!filters.statut || v.statut === filters.statut) &&
          (!filters.stock ||
            (filters.stock === 'disponible' ? v.stock_disponible > 0 : v.stock_disponible <= 0)),
      ),
    [variantes, filters],
  )

  // La variante ciblée est conservée après la fermeture de la modale :
  // son contenu ne doit pas changer pendant l'animation de sortie.
  const [formState, setFormState] = useState({ open: false, variante: null })
  const [toggle, setToggle] = useState({ open: false, variante: null })

  const openCreate = () => setFormState({ open: true, variante: null })
  const openEdit = (variante) => setFormState({ open: true, variante })
  const closeForm = () => setFormState((state) => ({ ...state, open: false }))
  const closeToggle = () => setToggle((state) => ({ ...state, open: false }))

  async function changeStatut(variante) {
    try {
      const result = await statutMutation.mutateAsync({
        idProduit: id,
        idVariante: variante.id_variante,
      })
      // Le message suit la réponse du serveur, pas notre hypothèse
      const statut = result?.data?.statut
      const name = `« ${variante.sku} »`
      if (statut === 'ACTIF') notify.success(`Variante ${name} activée.`)
      else if (statut === 'INACTIF') notify.success(`Variante ${name} désactivée.`)
      else notify.success(`Statut de la variante ${name} modifié.`)
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  function handleToggleClick(variante) {
    // Désactiver demande confirmation, activer est sans risque
    if (variante.statut === 'ACTIF') {
      setToggle({ open: true, variante })
    } else {
      changeStatut(variante)
    }
  }

  async function confirmDeactivation() {
    await changeStatut(toggle.variante)
    closeToggle()
  }

  const columns = [
    {
      key: 'variante',
      header: 'Variante',
      mobile: 'title',
      render: (v) => (
        <div className={styles.variant}>
          <div className={styles.thumb}>
            <ProductImage src={v.image} />
          </div>
          <div className={styles.variantText}>
            <strong className={styles.name}>{v.modele || 'Sans modèle'}</strong>
            <span className={styles.size}>{v.taille ? `Taille : ${v.taille}` : 'Sans taille'}</span>
          </div>
        </div>
      ),
    },
    { key: 'sku', header: 'SKU', render: (v) => <code className={styles.sku}>{v.sku}</code> },
    { key: 'stock', header: 'Stock total', align: 'center', render: (v) => v.quantite_stock },
    { key: 'reserve', header: 'Réservé', align: 'center', render: (v) => v.quantite_reservee },
    {
      key: 'disponible',
      header: 'Disponible',
      align: 'center',
      render: (v) => <strong>{v.stock_disponible}</strong>,
    },
    { key: 'statut', header: 'Statut', render: (v) => <StatutBadge statut={v.statut} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      mobile: 'actions',
      render: (v) => (
        <div className={styles.actions}>
          <Button
            as={Link}
            to={`/admin/stock/variantes/${v.id_variante}`}
            variant="soft"
            size="sm"
            className={styles.iconAction}
            aria-label={`Stock de la variante ${v.sku}`}
            title="Stock"
            leftIcon={<IconBoxMultipleFilled size={18} aria-hidden="true" />}
          >
            <span className="sr-only">Stock</span>
          </Button>
          <Button
            variant="soft"
            size="sm"
            className={styles.iconAction}
            onClick={() => openEdit(v)}
            aria-label={`Modifier la variante ${v.sku}`}
            title="Modifier"
            leftIcon={<IconPencilFilled size={18} aria-hidden="true" />}
          >
            <span className="sr-only">Modifier</span>
          </Button>
          <Button
            variant="soft"
            size="sm"
            className={styles.statusToggle}
            onClick={() => handleToggleClick(v)}
            disabled={statutMutation.isPending}
            role="switch"
            aria-checked={v.statut === 'ACTIF'}
            aria-label={`${v.statut === 'ACTIF' ? 'Désactiver' : 'Activer'} la variante ${v.sku}`}
            title={v.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}
            data-active={v.statut === 'ACTIF'}
          >
            <span className="sr-only">{v.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}</span>
          </Button>
        </div>
      ),
    },
  ]

  function renderContent() {
    if (isPending) {
      return (
        <div className={styles.skeletons} aria-busy="true" aria-label="Chargement des variantes">
          {Array.from({ length: 3 }, (_, i) => (
            <span key={i} className={styles.skeleton} />
          ))}
        </div>
      )
    }

    if (isError) {
      if (error?.response?.status === 404) {
        return (
          <StateMessage
            isError
            title="Produit introuvable."
            message="Ce produit n'existe pas ou a été supprimé."
            actionLabel="Retour aux produits"
            onAction={() => navigate('/admin/produits')}
          />
        )
      }
      return (
        <StateMessage
          isError
          title="Impossible de charger les variantes."
          message="Vérifiez votre connexion puis réessayez."
          actionLabel="Réessayer"
          onAction={() => refetch()}
        />
      )
    }

    if (variantes.length === 0) {
      return (
        <StateMessage
          title="Aucune variante pour ce produit."
          message="Sans variante, un produit n'a ni image ni stock."
          actionLabel="Ajouter une variante"
          onAction={openCreate}
        />
      )
    }

    return (
      <>
        <FilterBar
          hasActiveFilters={hasActive}
          onReset={reset}
          summary={formatResultCount(filtered.length, variantes.length)}
        >
          <SearchFilter
            value={filters.search}
            onChange={(value) => setFilter('search', value)}
            placeholder="Modèle, taille ou SKU…"
          />
          <SelectFilter
            label="Statut"
            placeholder="Tous les statuts"
            options={STATUT_OPTIONS}
            value={filters.statut}
            onChange={(value) => setFilter('statut', value)}
          />
          <SelectFilter
            label="Stock"
            placeholder="Tous les stocks"
            options={STOCK_OPTIONS}
            value={filters.stock}
            onChange={(value) => setFilter('stock', value)}
          />
        </FilterBar>

        {filtered.length === 0 ? (
          <StateMessage
            title="Aucune variante ne correspond."
            message="Modifiez ou réinitialisez les filtres."
            actionLabel="Réinitialiser les filtres"
            onAction={reset}
          />
        ) : (
          <DataTable
            caption="Liste des variantes du produit"
            columns={columns}
            rows={filtered}
            rowKey={(v) => v.id_variante}
          />
        )}
      </>
    )
  }

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <Link to="/admin/produits" className={styles.back}>
          ← Retour aux produits
        </Link>

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Variantes</h1>
            {data && (
              <p className={styles.subtitle}>
                {data.produit.nom_produit} · {formatPrix(data.produit.prix)} (prix commun à
                toutes les variantes)
              </p>
            )}
          </div>
          <Button
            variant="dark"
            leftIcon={<IconPlus size={18} />}
            onClick={openCreate}
            disabled={!data}
          >
            Ajouter une variante
          </Button>
        </header>

        {renderContent()}
      </section>

      <VarianteFormModal
        isOpen={formState.open}
        produitId={id}
        variante={formState.variante}
        onClose={closeForm}
      />

      <ConfirmDialog
        isOpen={toggle.open}
        onClose={closeToggle}
        onConfirm={confirmDeactivation}
        loading={statutMutation.isPending}
        title="Désactiver la variante ?"
        message={`La variante « ${toggle.variante?.sku ?? ''} » ne sera plus proposée aux clients. Vous pourrez la réactiver à tout moment.`}
        confirmLabel="Désactiver"
        confirmVariant="danger"
      />
    </div>
  )
}