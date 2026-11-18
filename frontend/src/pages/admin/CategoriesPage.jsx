import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import { IconPencilFilled, IconPlus } from '../../components/ui/tablerIcons'
import DataTable from '../../components/admin/DataTable'
import StatutBadge from '../../components/admin/StatutBadge'
import FilterBar, { SearchFilter, SelectFilter } from '../../components/admin/FilterBar'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import StateMessage from '../../components/common/StateMessage'
import CategorieFormModal from './CategorieFormModal'
import { useAdminCategories, useSetCategorieStatut } from '../../hooks/useAdminCategories'
import { useFilters } from '../../hooks/useFilters'
import { useNotification } from '../../hooks/useNotification'
import { getErrorMessage } from '../../utils/errors'
import { matchesSearch } from '../../utils/filters'
import { STATUT_OPTIONS } from '../../utils/filterOptions'
import { formatDate, formatResultCount } from '../../utils/format'
import styles from './CategoriesPage.module.css'

const EMPTY = []
const INITIAL_FILTERS = { search: '', statut: '' }

export default function CategoriesPage() {
  const notify = useNotification()
  const { data, isPending, isError, refetch } = useAdminCategories()
  const statutMutation = useSetCategorieStatut()
  const categories = data ?? EMPTY

  const { filters, setFilter, reset, hasActive } = useFilters(INITIAL_FILTERS)

  const filtered = useMemo(
    () =>
      categories.filter(
        (c) =>
          matchesSearch(filters.search, [c.nom_categorie, c.description]) &&
          (!filters.statut || c.statut === filters.statut),
      ),
    [categories, filters],
  )

  // La catégorie ciblée est conservée après la fermeture de la modale :
  // son contenu ne doit pas changer pendant l'animation de sortie.
  const [formState, setFormState] = useState({ open: false, categorie: null })
  const [toggle, setToggle] = useState({ open: false, categorie: null })

  const openCreate = () => setFormState({ open: true, categorie: null })
  const openEdit = (categorie) => setFormState({ open: true, categorie })
  const closeForm = () => setFormState((state) => ({ ...state, open: false }))
  const closeToggle = () => setToggle((state) => ({ ...state, open: false }))

  async function changeStatut(categorie) {
    const statut = categorie.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF'
    try {
      await statutMutation.mutateAsync({ id: categorie.id_categorie, statut })
      notify.success(
        statut === 'ACTIF'
          ? `Catégorie « ${categorie.nom_categorie} » activée.`
          : `Catégorie « ${categorie.nom_categorie} » désactivée.`,
      )
    } catch (error) {
      notify.error(getErrorMessage(error))
    }
  }

  function handleToggleClick(categorie) {
    // Désactiver demande confirmation, activer est sans risque
    if (categorie.statut === 'ACTIF') {
      setToggle({ open: true, categorie })
    } else {
      changeStatut(categorie)
    }
  }

  async function confirmDeactivation() {
    await changeStatut(toggle.categorie)
    closeToggle()
  }

  const columns = [
    {
      key: 'nom',
      header: 'Catégorie',
      mobile: 'title',
      render: (c) => <strong className={styles.name}>{c.nom_categorie}</strong>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (c) => <span className={styles.description}>{c.description || '—'}</span>,
    },
    { key: 'produits', header: 'Produits', align: 'center', render: (c) => c.produits_count ?? 0 },
    { key: 'date', header: 'Créée le', render: (c) => formatDate(c.date_creation) },
    { key: 'statut', header: 'Statut', render: (c) => <StatutBadge statut={c.statut} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      mobile: 'actions',
      render: (c) => (
        <div className={styles.actions}>
          <Button
            variant="soft"
            size="sm"
            className={styles.iconAction}
            onClick={() => openEdit(c)}
            aria-label={`Modifier la catégorie ${c.nom_categorie}`}
            title="Modifier"
            leftIcon={<IconPencilFilled size={18} aria-hidden="true" />}
          >
            <span className="sr-only">Modifier</span>
          </Button>
          <Button
            variant="soft"
            size="sm"
            className={styles.statusToggle}
            onClick={() => handleToggleClick(c)}
            disabled={statutMutation.isPending}
            role="switch"
            aria-checked={c.statut === 'ACTIF'}
            aria-label={`${c.statut === 'ACTIF' ? 'Désactiver' : 'Activer'} la catégorie ${c.nom_categorie}`}
            title={c.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}
            data-active={c.statut === 'ACTIF'}
          >
            <span className="sr-only">{c.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}</span>
          </Button>
        </div>
      ),
    },
  ]

  function renderContent() {
    if (isPending) {
      return (
        <div className={styles.skeletons} aria-busy="true" aria-label="Chargement des catégories">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className={styles.skeleton} />
          ))}
        </div>
      )
    }

    if (isError) {
      return (
        <StateMessage
          isError
          title="Impossible de charger les catégories."
          message="Vérifiez votre connexion puis réessayez."
          actionLabel="Réessayer"
          onAction={() => refetch()}
        />
      )
    }

    if (categories.length === 0) {
      return (
        <StateMessage
          title="Aucune catégorie pour le moment."
          message="Créez votre première catégorie pour organiser vos produits."
          actionLabel="Ajouter une catégorie"
          onAction={openCreate}
        />
      )
    }

    return (
      <>
        <FilterBar
          hasActiveFilters={hasActive}
          onReset={reset}
          summary={formatResultCount(filtered.length, categories.length)}
        >
          <SearchFilter
            value={filters.search}
            onChange={(value) => setFilter('search', value)}
            placeholder="Nom ou description…"
          />
          <SelectFilter
            label="Statut"
            placeholder="Tous les statuts"
            options={STATUT_OPTIONS}
            value={filters.statut}
            onChange={(value) => setFilter('statut', value)}
          />
        </FilterBar>

        {filtered.length === 0 ? (
          <StateMessage
            title="Aucune catégorie ne correspond."
            message="Modifiez ou réinitialisez les filtres."
            actionLabel="Réinitialiser les filtres"
            onAction={reset}
          />
        ) : (
          <DataTable
            caption="Liste des catégories"
            columns={columns}
            rows={filtered}
            rowKey={(c) => c.id_categorie}
          />
        )}
      </>
    )
  }

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Catégories</h1>
            <p className={styles.subtitle}>Organisez les produits de votre boutique.</p>
          </div>
          <Button variant="dark" leftIcon={<IconPlus size={18} />} onClick={openCreate}>
            Ajouter une catégorie
          </Button>
        </header>

        {renderContent()}
      </section>

      <CategorieFormModal
        isOpen={formState.open}
        categorie={formState.categorie}
        onClose={closeForm}
      />

      <ConfirmDialog
        isOpen={toggle.open}
        onClose={closeToggle}
        onConfirm={confirmDeactivation}
        loading={statutMutation.isPending}
        title="Désactiver la catégorie ?"
        message={`Voulez-vous désactiver la catégorie « ${toggle.categorie?.nom_categorie ?? ''} » ? Vous pourrez la réactiver à tout moment.`}
        confirmLabel="Désactiver"
        confirmVariant="danger"
      />
    </div>
  )
}