import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import { IconPlus } from '../../components/ui/tablerIcons'
import DataTable from '../../components/admin/DataTable'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import StateMessage from '../../components/common/StateMessage'
import Pagination from '../../components/common/Pagination'
import ProductImage from '../../components/shop/ProductImage'
import ProduitFormModal from './ProduitFormModal'
import { useAdminProduits, useToggleProduitStatut } from '../../hooks/useAdminProduits'
import { useNotification } from '../../hooks/useNotification'
import { getErrorMessage } from '../../utils/errors'
import { formatPrix } from '../../utils/format'
import styles from './ProduitsPage.module.css'

function StatutBadge({ statut }) {
  if (statut === 'ACTIF') return <StatusBadge tone="success">Actif</StatusBadge>
  if (statut === 'INACTIF') return <StatusBadge tone="neutral">Inactif</StatusBadge>
  return <StatusBadge tone="warning">{statut}</StatusBadge>
}

export default function ProduitsPage() {
  const notify = useNotification()
  const location = useLocation()
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const { data, isPending, isError, isFetching, refetch } = useAdminProduits(page)
  const statutMutation = useToggleProduitStatut()

  // Le produit ciblé est conservé après la fermeture de la modale :
  // son contenu ne doit pas changer pendant l'animation de sortie.
  const [formState, setFormState] = useState(() => ({
    open: Boolean(location.state?.openCreate), // arrivée depuis « Ajouter un produit » du tableau de bord
    produit: null,
  }))
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
    { key: 'statut', header: 'Statut', render: (p) => <StatutBadge statut={p.statut} /> },
    {
      key: 'actions',
      header: 'Actions',
      mobile: 'actions',
      align: 'right',
      render: (p) => (
        <div className={styles.actions}>
          <Button
            as={Link}
            to={`/admin/produits/${p.id_produit}/variantes`}
            variant="soft"
            size="sm"
          >
            Variantes
          </Button>
          <Button variant="soft" size="sm" onClick={() => openEdit(p)}>
            Modifier
          </Button>
          <Button
            variant="soft"
            size="sm"
            onClick={() => handleToggleClick(p)}
            disabled={statutMutation.isPending}
          >
            {p.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}
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

    if (data.items.length === 0) {
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
        <div className={isFetching ? styles.fetching : undefined} aria-busy={isFetching}>
          <DataTable
            caption="Liste des produits"
            columns={columns}
            rows={data.items}
            rowKey={(p) => p.id_produit}
          />
        </div>
        <Pagination
          page={page}
          lastPage={data.pagination.lastPage}
          onChange={handlePageChange}
          disabled={isFetching}
        />
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
                ? `${data.pagination.total} produit${data.pagination.total > 1 ? 's' : ''} au catalogue`
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