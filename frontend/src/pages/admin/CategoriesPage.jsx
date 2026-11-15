import { useState } from 'react'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import { IconPlus } from '../../components/ui/tablerIcons'
import DataTable from '../../components/admin/DataTable'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import StateMessage from '../../components/common/StateMessage'
import CategorieFormModal from './CategorieFormModal'
import { useAdminCategories, useSetCategorieStatut } from '../../hooks/useAdminCategories'
import { useNotification } from '../../hooks/useNotification'
import { getErrorMessage } from '../../utils/errors'
import { formatDate } from '../../utils/format'
import styles from './CategoriesPage.module.css'

function StatutBadge({ statut }) {
  if (statut === 'ACTIF') return <StatusBadge tone="success">Actif</StatusBadge>
  if (statut === 'INACTIF') return <StatusBadge tone="neutral">Inactif</StatusBadge>
  return <StatusBadge tone="warning">{statut}</StatusBadge>
}

export default function CategoriesPage() {
  const notify = useNotification()
  const { data: categories, isPending, isError, refetch } = useAdminCategories()
  const statutMutation = useSetCategorieStatut()

  // On garde la catégorie ciblée même après la fermeture de la modale :
  // le contenu ne doit pas changer pendant l'animation de sortie.
  const [formState, setFormState] = useState({ open: false, categorie: null })
  const [toggle, setToggle] = useState({ open: false, categorie: null })

  const openCreate = () => setFormState({ open: true, categorie: null })
  const openEdit = (categorie) => setFormState({ open: true, categorie })
  const closeForm = () => setFormState((state) => ({ ...state, open: false }))

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
    setToggle((state) => ({ ...state, open: false }))
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
          <Button variant="soft" size="sm" onClick={() => openEdit(c)}>
            Modifier
          </Button>
          <Button
            variant="soft"
            size="sm"
            onClick={() => handleToggleClick(c)}
            disabled={statutMutation.isPending}
          >
            {c.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}
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
      <DataTable
        caption="Liste des catégories"
        columns={columns}
        rows={categories}
        rowKey={(c) => c.id_categorie}
      />
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
        onClose={() => setToggle((state) => ({ ...state, open: false }))}
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