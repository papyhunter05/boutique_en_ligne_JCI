import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { IconPlus } from '../../components/ui/tablerIcons'
import DataTable from '../../components/admin/DataTable'
import StatutBadge from '../../components/admin/StatutBadge'
import ValueBadge from '../../components/admin/ValueBadge'
import UtilisateurStatutAction from '../../components/admin/UtilisateurStatutAction'
import FilterBar, { SearchFilter, SelectFilter } from '../../components/admin/FilterBar'
import StateMessage from '../../components/common/StateMessage'
import Pagination from '../../components/common/Pagination'
import AdministrateurFormModal from './AdministrateurFormModal'
import { useUtilisateurs } from '../../hooks/useAdminUtilisateurs'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useFilters } from '../../hooks/useFilters'
import { USER_ROLE_OPTIONS, USER_STATUT_OPTIONS } from '../../utils/filterOptions'
import { ROLE_LABELS, ROLE_TONES } from '../../utils/roles'
import { pluralize } from '../../utils/format'
import styles from './CommandesPage.module.css' // mêmes classes que la page Commandes

const EMPTY = []
const INITIAL_FILTERS = { search: '', statut: '', role: '' }

export default function UtilisateursPage() {
  const { filters, setFilter, reset, hasActive } = useFilters(INITIAL_FILTERS)
  const [createOpen, setCreateOpen] = useState(false)

  // La recherche est envoyée après une courte pause de frappe
  const search = useDebouncedValue(filters.search)
  const apiFilters = useMemo(
    () => ({ search: search.trim(), statut: filters.statut, role: filters.role }),
    [search, filters.statut, filters.role],
  )

  // Un changement de filtre ramène à la page 1
  const filterKey = JSON.stringify(apiFilters)
  const [pageState, setPageState] = useState({ page: 1, key: filterKey })
  const page = pageState.key === filterKey ? pageState.page : 1

  const { data, isPending, isError, isFetching, refetch } = useUtilisateurs(page, apiFilters)
  const items = data?.items ?? EMPTY

  function handlePageChange(newPage) {
    setPageState({ page: newPage, key: filterKey })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const columns = [
    {
      key: 'utilisateur',
      header: 'Utilisateur',
      mobile: 'title',
      render: (u) => (
        <Link to={`/admin/utilisateurs/${u.id_utilisateur}`} className={styles.reference}>
          {u.prenom} {u.nom}
        </Link>
      ),
    },
    { key: 'email', header: 'Email', render: (u) => <span className={styles.client}><span>{u.email}</span></span> },
    { key: 'telephone', header: 'Téléphone', render: (u) => u.telephone || '—' },
    {
      key: 'role',
      header: 'Rôle',
      render: (u) => <ValueBadge value={u.role} labels={ROLE_LABELS} tones={ROLE_TONES} />,
    },
    { key: 'statut', header: 'Statut', render: (u) => <StatutBadge statut={u.statut} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      mobile: 'actions',
      render: (u) => (
        <div className={styles.actions}>
          <Button as={Link} to={`/admin/utilisateurs/${u.id_utilisateur}`} variant="soft" size="sm">
            Détails
          </Button>
          <UtilisateurStatutAction utilisateur={u} />
        </div>
      ),
    },
  ]

  function renderContent() {
    if (isPending) {
      return (
        <div className={styles.skeletons} aria-busy="true" aria-label="Chargement des utilisateurs">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={styles.skeleton} />
          ))}
        </div>
      )
    }

    // L'erreur ne remplace la liste que s'il n'y a rien à montrer
    if (isError && !data) {
      return (
        <StateMessage
          isError
          title="Impossible de charger les utilisateurs."
          message="Vérifiez votre connexion puis réessayez."
          actionLabel="Réessayer"
          onAction={() => refetch()}
        />
      )
    }

    if (data.pagination.total === 0 && !hasActive) {
      return (
        <StateMessage
          title="Aucun utilisateur pour le moment."
          message="Les clients inscrits et les administrateurs apparaîtront ici."
        />
      )
    }

    return (
      <>
        <FilterBar
          hasActiveFilters={hasActive}
          onReset={reset}
          summary={pluralize(data.pagination.total, 'utilisateur')}
        >
          <SearchFilter
            value={filters.search}
            onChange={(value) => setFilter('search', value)}
            placeholder="Nom, prénom, email, téléphone…"
          />
          <SelectFilter
            label="Rôle"
            placeholder="Tous les rôles"
            options={USER_ROLE_OPTIONS}
            value={filters.role}
            onChange={(value) => setFilter('role', value)}
          />
          <SelectFilter
            label="Statut"
            placeholder="Tous les statuts"
            options={USER_STATUT_OPTIONS}
            value={filters.statut}
            onChange={(value) => setFilter('statut', value)}
          />
        </FilterBar>

        {items.length === 0 ? (
          <StateMessage
            title="Aucun utilisateur ne correspond."
            message="Modifiez ou réinitialisez les filtres."
            actionLabel="Réinitialiser les filtres"
            onAction={reset}
          />
        ) : (
          <>
            <div className={isFetching ? styles.fetching : undefined} aria-busy={isFetching}>
              <DataTable
                caption="Liste des utilisateurs"
                columns={columns}
                rows={items}
                rowKey={(u) => u.id_utilisateur}
                rowTone={(u) => (u.statut === 'BLOQUE' ? 'danger' : undefined)}
              />
            </div>
            <Pagination
              page={data.pagination.currentPage}
              lastPage={data.pagination.lastPage}
              onChange={handlePageChange}
              disabled={isFetching}
              label="Pagination des utilisateurs"
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
            <h1 className={styles.title}>Utilisateurs</h1>
            <p className={styles.subtitle}>
              Consultez les clients et les administrateurs, et gérez l'accès à leur compte.
            </p>
          </div>
          <Button variant="dark" leftIcon={<IconPlus size={18} />} onClick={() => setCreateOpen(true)}>
            Créer un administrateur
          </Button>
        </header>

        {renderContent()}
      </section>

      <AdministrateurFormModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}