import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import DataTable from '../../components/admin/DataTable'
import ValueBadge from '../../components/admin/ValueBadge'
import LivraisonActions from '../../components/admin/LivraisonActions'
import FilterBar, { DateFilter, SearchFilter, SelectFilter } from '../../components/admin/FilterBar'
import StateMessage from '../../components/common/StateMessage'
import Pagination from '../../components/common/Pagination'
import { useLivraisons } from '../../hooks/useAdminLivraisons'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useFilters } from '../../hooks/useFilters'
import {
  COMMANDE_STATUT_LABELS,
  COMMANDE_STATUT_TONES,
  KNOWN_ZONES,
  LIVRAISON_STATUT_LABELS,
  LIVRAISON_STATUT_TONES,
  ZONE_LABELS,
  labelOf,
  toOptions,
} from '../../utils/commandeFields'
import { FILTERABLE_STATUTS } from '../../utils/livraisonTransitions'
import { formatDateTime, pluralize } from '../../utils/format'
import styles from './CommandesPage.module.css' // mêmes classes que la page Commandes

const EMPTY = []
const INITIAL_FILTERS = { search: '', statut: '', zone: '', from: '', to: '' }

// Valeurs fixes (enum de la table) : définies hors du composant
const STATUT_OPTIONS = toOptions(FILTERABLE_STATUTS, LIVRAISON_STATUT_LABELS)
const ZONE_OPTIONS = toOptions(KNOWN_ZONES, ZONE_LABELS)

export default function LivraisonsPage() {
  const { filters, setFilter, reset, hasActive } = useFilters(INITIAL_FILTERS)

  // La recherche est envoyée après une courte pause de frappe
  const search = useDebouncedValue(filters.search)
  const apiFilters = useMemo(
    () => ({
      search: search.trim(),
      statut: filters.statut,
      zone: filters.zone,
      from: filters.from,
      to: filters.to,
    }),
    [search, filters.statut, filters.zone, filters.from, filters.to],
  )

  // Un changement de filtre ramène à la page 1
  const filterKey = JSON.stringify(apiFilters)
  const [pageState, setPageState] = useState({ page: 1, key: filterKey })
  const page = pageState.key === filterKey ? pageState.page : 1

  const { data, isPending, isError, isFetching, refetch } = useLivraisons(page, apiFilters)
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
      render: (l) => (
        <Link to={`/admin/livraisons/${l.id_livraison}`} className={styles.reference}>
          {l.commande?.reference ?? `Livraison n°${l.id_livraison}`}
        </Link>
      ),
    },
    {
      key: 'destinataire',
      header: 'Destinataire',
      render: (l) => (
        <div className={styles.client}>
          <strong>{l.nom_destinataire}</strong>
          <span>{l.telephone}</span>
        </div>
      ),
    },
    {
      key: 'destination',
      header: 'Destination',
      render: (l) => (
        <div className={styles.client}>
          <strong>{l.ville}</strong>
          <span>
            {labelOf(ZONE_LABELS, l.zone_livraison)}
            {l.agence ? ` · ${l.agence.nom_agence}` : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'statut',
      header: 'Livraison',
      render: (l) => (
        <ValueBadge
          value={l.statut}
          labels={LIVRAISON_STATUT_LABELS}
          tones={LIVRAISON_STATUT_TONES}
        />
      ),
    },
    {
      key: 'statutCommande',
      header: 'Statut commande',
      render: (l) => (
        <ValueBadge
          value={l.commande?.statut}
          labels={COMMANDE_STATUT_LABELS}
          tones={COMMANDE_STATUT_TONES}
        />
      ),
    },
    { key: 'suivi', header: 'N° de suivi', render: (l) => l.numero_suivi || '—' },
    {
      key: 'date',
      header: 'Commande passée le',
      render: (l) =>
        l.commande?.date_commande ? (
          <time dateTime={l.commande.date_commande} className={styles.nowrap}>
            {formatDateTime(l.commande.date_commande)}
          </time>
        ) : (
          '—'
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      mobile: 'actions',
      render: (l) => (
        <div className={styles.actions}>
          <Button as={Link} to={`/admin/livraisons/${l.id_livraison}`} variant="soft" size="sm">
            Détails
          </Button>
          <LivraisonActions
            livraison={l}
            commandeStatut={l.commande?.statut}
            commandeReference={l.commande?.reference}
          />
        </div>
      ),
    },
  ]

  function renderContent() {
    if (isPending) {
      return (
        <div className={styles.skeletons} aria-busy="true" aria-label="Chargement des livraisons">
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
          title="Impossible de charger les livraisons."
          message="Vérifiez votre connexion puis réessayez."
          actionLabel="Réessayer"
          onAction={() => refetch()}
        />
      )
    }

    if (data.pagination.total === 0 && !hasActive) {
      return (
        <StateMessage
          title="Aucune livraison pour le moment."
          message="Les commandes livrées à Antananarivo ou en province apparaîtront ici. Les retraits au magasin n'ont pas de livraison."
        />
      )
    }

    return (
      <>
        <FilterBar
          hasActiveFilters={hasActive}
          onReset={reset}
          summary={pluralize(data.pagination.total, 'livraison')}
        >
          <SearchFilter
            value={filters.search}
            onChange={(value) => setFilter('search', value)}
            placeholder="Suivi, destinataire, ville, référence, client, agence…"
          />
          <SelectFilter
            label="Statut"
            placeholder="Tous les statuts"
            options={STATUT_OPTIONS}
            value={filters.statut}
            onChange={(value) => setFilter('statut', value)}
          />
          <SelectFilter
            label="Zone"
            placeholder="Toutes les zones"
            options={ZONE_OPTIONS}
            value={filters.zone}
            onChange={(value) => setFilter('zone', value)}
          />
          {/* Le backend filtre sur la date de la commande, pas celle de la livraison */}
          <DateFilter
            label="Commande du"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(value) => setFilter('from', value)}
          />
          <DateFilter
            label="Commande au"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(value) => setFilter('to', value)}
          />
        </FilterBar>

        {items.length === 0 ? (
          <StateMessage
            title="Aucune livraison ne correspond."
            message="Modifiez ou réinitialisez les filtres."
            actionLabel="Réinitialiser les filtres"
            onAction={reset}
          />
        ) : (
          <>
            <div className={isFetching ? styles.fetching : undefined} aria-busy={isFetching}>
              <DataTable
                caption="Liste des livraisons"
                columns={columns}
                rows={items}
                rowKey={(l) => l.id_livraison}
              />
            </div>
            <Pagination
              page={data.pagination.currentPage}
              lastPage={data.pagination.lastPage}
              onChange={handlePageChange}
              disabled={isFetching}
              label="Pagination des livraisons"
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
            <h1 className={styles.title}>Livraisons</h1>
            <p className={styles.subtitle}>
              Suivez les livraisons et faites-les avancer étape par étape. Seules les actions
              possibles sont proposées.
            </p>
          </div>
        </header>

        {renderContent()}
      </section>
    </div>
  )
}