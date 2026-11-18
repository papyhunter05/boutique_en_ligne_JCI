import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { IconFileDescriptionFilled } from '../../components/ui/tablerIcons'
import DataTable from '../../components/admin/DataTable'
import ValueBadge from '../../components/admin/ValueBadge'
import DeliverButton from '../../components/admin/DeliverButton'
import FilterBar, { DateFilter, SearchFilter, SelectFilter } from '../../components/admin/FilterBar'
import StateMessage from '../../components/common/StateMessage'
import Pagination from '../../components/common/Pagination'
import { useCommandes } from '../../hooks/useAdminCommandes'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useFilters } from '../../hooks/useFilters'
import {
  COMMANDE_STATUT_LABELS,
  COMMANDE_STATUT_TONES,
  KNOWN_COMMANDE_STATUTS,
  KNOWN_MODES,
  MODE_LABELS,
  ZONE_LABELS,
  labelOf,
  toOptions,
} from '../../utils/commandeFields'
import { formatDateTime, formatPrix, pluralize } from '../../utils/format'
import styles from './CommandesPage.module.css'

const EMPTY = []
const INITIAL_FILTERS = { search: '', statut: '', mode: '', from: '', to: '' }

// Valeurs fixes (enum de la table) : définies hors du composant
const COMMANDE_STATUT_OPTIONS = toOptions(KNOWN_COMMANDE_STATUTS, COMMANDE_STATUT_LABELS)
const MODE_OPTIONS = toOptions(KNOWN_MODES, MODE_LABELS)

export default function CommandesPage() {
  const { filters, setFilter, reset, hasActive } = useFilters(INITIAL_FILTERS)

  // La recherche est envoyée après une courte pause de frappe
  const search = useDebouncedValue(filters.search)
  const apiFilters = useMemo(
    () => ({
      search: search.trim(),
      statut: filters.statut,
      mode: filters.mode,
      from: filters.from,
      to: filters.to,
    }),
    [search, filters.statut, filters.mode, filters.from, filters.to],
  )

  // Un changement de filtre ramène à la page 1
  const filterKey = JSON.stringify(apiFilters)
  const [pageState, setPageState] = useState({ page: 1, key: filterKey })
  const page = pageState.key === filterKey ? pageState.page : 1

  const { data, isPending, isError, isFetching, refetch } = useCommandes(page, apiFilters)
  const items = data?.items ?? EMPTY

  function handlePageChange(newPage) {
    setPageState({ page: newPage, key: filterKey })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const columns = [
    {
      key: 'reference',
      header: 'Commande',
      mobile: 'title',
      render: (c) => (
        <Link to={`/admin/commandes/${c.id_commande}`} className={styles.reference}>
          {c.reference}
        </Link>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (c) =>
        c.date_commande ? (
          <time dateTime={c.date_commande} className={styles.nowrap}>
            {formatDateTime(c.date_commande)}
          </time>
        ) : (
          '—'
        ),
    },
    {
      key: 'client',
      header: 'Client',
      render: (c) =>
        c.utilisateur ? (
          <div className={styles.client}>
            <strong>
              {c.utilisateur.prenom} {c.utilisateur.nom}
            </strong>
            <span>{c.utilisateur.email}</span>
          </div>
        ) : (
          '—'
        ),
    },
    { key: 'mode', header: 'Réception', render: (c) => labelOf(MODE_LABELS, c.mode_reception) },
    {
      key: 'livraison',
      header: 'Livraison',
      render: (c) =>
        c.livraison ? (
          <div className={styles.client}>
            <strong>{c.livraison.ville || '—'}</strong>
            <span>{labelOf(ZONE_LABELS, c.livraison.zone_livraison)}</span>
          </div>
        ) : (
          '—'
        ),
    },
    {
      key: 'statut',
      header: 'Statut',
      render: (c) => (
        <ValueBadge
          value={c.statut}
          labels={COMMANDE_STATUT_LABELS}
          tones={COMMANDE_STATUT_TONES}
        />
      ),
    },
    { key: 'total', header: 'Total', render: (c) => formatPrix(c.montant_total) },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      mobile: 'actions',
      render: (c) => (
        <div className={styles.actions}>
          <Button
            as={Link}
            to={`/admin/commandes/${c.id_commande}`}
            variant="soft"
            size="sm"
            className={styles.iconAction}
            aria-label={`Détails de la commande ${c.reference}`}
            title="Détails"
            leftIcon={<IconFileDescriptionFilled size={18} aria-hidden="true" />}
          >
            <span className="sr-only">Détails</span>
          </Button>
          <DeliverButton iconOnly className={styles.iconAction} />
        </div>
      ),
    },
  ]

  function renderContent() {
    if (isPending) {
      return (
        <div className={styles.skeletons} aria-busy="true" aria-label="Chargement des commandes">
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
          title="Impossible de charger les commandes."
          message="Vérifiez votre connexion puis réessayez."
          actionLabel="Réessayer"
          onAction={() => refetch()}
        />
      )
    }

    if (data.pagination.total === 0 && !hasActive) {
      return (
        <StateMessage
          title="Aucune commande pour le moment."
          message="Les commandes passées par les clients apparaîtront ici."
        />
      )
    }

    return (
      <>
        <FilterBar
          hasActiveFilters={hasActive}
          onReset={reset}
          summary={pluralize(data.pagination.total, 'commande')}
        >
          <SearchFilter
            value={filters.search}
            onChange={(value) => setFilter('search', value)}
            placeholder="Référence, nom, email, téléphone…"
          />
          <SelectFilter
            label="Statut"
            placeholder="Tous les statuts"
            options={COMMANDE_STATUT_OPTIONS}
            value={filters.statut}
            onChange={(value) => setFilter('statut', value)}
          />
          <SelectFilter
            label="Réception"
            placeholder="Tous les modes"
            options={MODE_OPTIONS}
            value={filters.mode}
            onChange={(value) => setFilter('mode', value)}
          />
          <DateFilter
            label="Du"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(value) => setFilter('from', value)}
          />
          <DateFilter
            label="Au"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(value) => setFilter('to', value)}
          />
        </FilterBar>

        {items.length === 0 ? (
          <StateMessage
            title="Aucune commande ne correspond."
            message="Modifiez ou réinitialisez les filtres."
            actionLabel="Réinitialiser les filtres"
            onAction={reset}
          />
        ) : (
          <>
            <div className={isFetching ? styles.fetching : undefined} aria-busy={isFetching}>
              <DataTable
                caption="Liste des commandes"
                columns={columns}
                rows={items}
                rowKey={(c) => c.id_commande}
              />
            </div>
            <Pagination
              page={data.pagination.currentPage}
              lastPage={data.pagination.lastPage}
              onChange={handlePageChange}
              disabled={isFetching}
              label="Pagination des commandes"
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
            <h1 className={styles.title}>Commandes</h1>
            <p className={styles.subtitle}>
              Consultez les commandes de la boutique. Leur statut est géré par le système.
            </p>
          </div>
        </header>

        {renderContent()}
      </section>
    </div>
  )
}