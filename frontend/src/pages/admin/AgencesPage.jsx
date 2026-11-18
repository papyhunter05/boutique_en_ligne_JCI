import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import { IconPencilFilled, IconPlus } from '../../components/ui/tablerIcons'
import DataTable from '../../components/admin/DataTable'
import StatutBadge from '../../components/admin/StatutBadge'
import FilterBar, { SearchFilter, SelectFilter } from '../../components/admin/FilterBar'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import StateMessage from '../../components/common/StateMessage'
import AgenceFormModal from './AgenceFormModal'
import { useAdminAgences, useToggleAgenceStatut } from '../../hooks/useAdminAgences'
import { useFilters } from '../../hooks/useFilters'
import { useNotification } from '../../hooks/useNotification'
import { getErrorMessage } from '../../utils/errors'
import { matchesSearch } from '../../utils/filters'
import { AGENCE_STATUT_OPTIONS } from '../../utils/filterOptions'
import { formatDate, formatResultCount, pluralize } from '../../utils/format'
import styles from './AgencesPage.module.css'

const EMPTY = []
const INITIAL_FILTERS = { search: '', ville: '', statut: '' }

export default function AgencesPage() {
  const notify = useNotification()
  const { data, isPending, isError, refetch } = useAdminAgences()
  const statutMutation = useToggleAgenceStatut()
  const agences = data ?? EMPTY

  const { filters, setFilter, reset, hasActive } = useFilters(INITIAL_FILTERS)

  const villeOptions = useMemo(
    () =>
      [...new Set(agences.map((a) => a.ville).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'fr'))
        .map((ville) => ({ value: ville, label: ville })),
    [agences],
  )

  const filtered = useMemo(
    () =>
      agences.filter(
        (a) =>
          matchesSearch(filters.search, [a.nom_agence, a.ville, a.adresse, a.telephone, a.mail]) &&
          (!filters.ville || a.ville === filters.ville) &&
          (!filters.statut || a.statut === filters.statut),
      ),
    [agences, filters],
  )

  // L'agence ciblée est conservée après la fermeture de la modale :
  // son contenu ne doit pas changer pendant l'animation de sortie.
  const [formState, setFormState] = useState({ open: false, agence: null })
  const [toggle, setToggle] = useState({ open: false, agence: null })

  const openCreate = () => setFormState({ open: true, agence: null })
  const openEdit = (agence) => setFormState({ open: true, agence })
  const closeForm = () => setFormState((state) => ({ ...state, open: false }))
  const closeToggle = () => setToggle((state) => ({ ...state, open: false }))

  async function changeStatut(agence) {
    try {
      const result = await statutMutation.mutateAsync(agence.id)
      // Le serveur bascule le statut : le message suit sa réponse, pas notre hypothèse
      const statut = result?.data?.statut
      const name = `« ${agence.nom_agence} »`
      if (statut === 'ACTIVE') notify.success(`Agence ${name} réactivée.`)
      else if (statut === 'INACTIVE') notify.success(`Agence ${name} désactivée.`)
      else notify.success(`Statut de l'agence ${name} modifié.`)
    } catch (error) {
      notify.error(getErrorMessage(error))
    }
  }

  function handleToggleClick(agence) {
    // Désactiver demande confirmation, réactiver est sans risque
    if (agence.statut === 'ACTIVE') {
      setToggle({ open: true, agence })
    } else {
      changeStatut(agence)
    }
  }

  async function confirmDeactivation() {
    await changeStatut(toggle.agence)
    closeToggle()
  }

  const columns = [
    {
      key: 'agence',
      header: 'Agence',
      mobile: 'title',
      render: (a) => <strong className={styles.name}>{a.nom_agence}</strong>,
    },
    { key: 'ville', header: 'Ville', render: (a) => a.ville || '—' },
    {
      key: 'adresse',
      header: 'Adresse',
      render: (a) => <span className={styles.address}>{a.adresse || '—'}</span>,
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (a) =>
        a.telephone || a.mail ? (
          <div className={styles.contact}>
            {a.telephone && <span>{a.telephone}</span>}
            {a.mail && <span className={styles.mail}>{a.mail}</span>}
          </div>
        ) : (
          '—'
        ),
    },
    { key: 'date', header: 'Créée le', render: (a) => formatDate(a.date_creation) },
    { key: 'statut', header: 'Statut', render: (a) => <StatutBadge statut={a.statut} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      mobile: 'actions',
      render: (a) => (
        <div className={styles.actions}>
          <Button
            variant="soft"
            size="sm"
            className={styles.iconAction}
            onClick={() => openEdit(a)}
            aria-label={`Modifier l'agence ${a.nom_agence}`}
            title="Modifier"
            leftIcon={<IconPencilFilled size={18} aria-hidden="true" />}
          >
            <span className="sr-only">Modifier</span>
          </Button>
          <Button
            variant="soft"
            size="sm"
            className={styles.statusToggle}
            onClick={() => handleToggleClick(a)}
            disabled={statutMutation.isPending}
            role="switch"
            aria-checked={a.statut === 'ACTIVE'}
            aria-label={`${a.statut === 'ACTIVE' ? 'Désactiver' : 'Réactiver'} l'agence ${a.nom_agence}`}
            title={a.statut === 'ACTIVE' ? 'Désactiver' : 'Réactiver'}
            data-active={a.statut === 'ACTIVE'}
          >
            <span className="sr-only">{a.statut === 'ACTIVE' ? 'Désactiver' : 'Réactiver'}</span>
          </Button>
        </div>
      ),
    },
  ]

  function renderContent() {
    if (isPending) {
      return (
        <div className={styles.skeletons} aria-busy="true" aria-label="Chargement des agences">
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
          title="Impossible de charger les agences."
          message="Vérifiez votre connexion puis réessayez."
          actionLabel="Réessayer"
          onAction={() => refetch()}
        />
      )
    }

    if (agences.length === 0) {
      return (
        <StateMessage
          title="Aucune agence de transport pour le moment."
          message="Ajoutez une agence pour proposer la livraison en province."
          actionLabel="Ajouter une agence"
          onAction={openCreate}
        />
      )
    }

    return (
      <>
        <FilterBar
          hasActiveFilters={hasActive}
          onReset={reset}
          summary={formatResultCount(filtered.length, agences.length)}
        >
          <SearchFilter
            value={filters.search}
            onChange={(value) => setFilter('search', value)}
            placeholder="Nom, ville, adresse, contact…"
          />
          <SelectFilter
            label="Ville"
            placeholder="Toutes les villes"
            options={villeOptions}
            value={filters.ville}
            onChange={(value) => setFilter('ville', value)}
          />
          <SelectFilter
            label="Statut"
            placeholder="Tous les statuts"
            options={AGENCE_STATUT_OPTIONS}
            value={filters.statut}
            onChange={(value) => setFilter('statut', value)}
          />
        </FilterBar>

        {filtered.length === 0 ? (
          <StateMessage
            title="Aucune agence ne correspond."
            message="Modifiez ou réinitialisez les filtres."
            actionLabel="Réinitialiser les filtres"
            onAction={reset}
          />
        ) : (
          <DataTable
            caption="Liste des agences de transport"
            columns={columns}
            rows={filtered}
            rowKey={(a) => a.id}
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
            <h1 className={styles.title}>Agences de transport</h1>
            <p className={styles.subtitle}>
              {data
                ? `${pluralize(agences.length, 'agence')} pour la livraison en province`
                : 'Gérez les agences proposées pour la livraison en province.'}
            </p>
          </div>
          <Button variant="dark" leftIcon={<IconPlus size={18} />} onClick={openCreate}>
            Ajouter une agence
          </Button>
        </header>

        {renderContent()}
      </section>

      <AgenceFormModal isOpen={formState.open} agence={formState.agence} onClose={closeForm} />

      <ConfirmDialog
        isOpen={toggle.open}
        onClose={closeToggle}
        onConfirm={confirmDeactivation}
        loading={statutMutation.isPending}
        title="Désactiver l'agence ?"
        message={`L'agence « ${toggle.agence?.nom_agence ?? ''} » ne sera plus proposée aux clients pour les livraisons en province. Les commandes déjà passées conservent ses informations. Vous pourrez la réactiver à tout moment.`}
        confirmLabel="Désactiver"
        confirmVariant="danger"
      />
    </div>
  )
}