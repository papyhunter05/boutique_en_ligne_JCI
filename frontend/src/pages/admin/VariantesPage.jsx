import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { IconPlus } from '../../components/ui/tablerIcons'
import DataTable from '../../components/admin/DataTable'
import StatutBadge from '../../components/admin/StatutBadge'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import StateMessage from '../../components/common/StateMessage'
import ProductImage from '../../components/shop/ProductImage'
import VarianteFormModal from './VarianteFormModal'
import { useToggleVarianteStatut, useVariantes } from '../../hooks/useAdminVariantes'
import { useNotification } from '../../hooks/useNotification'
import { getErrorMessage } from '../../utils/errors'
import { formatPrix } from '../../utils/format'
import styles from './VariantesPage.module.css'

export default function VariantesPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const notify = useNotification()

  const { data, isPending, isError, error, refetch } = useVariantes(id)
  const statutMutation = useToggleVarianteStatut()

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
            <ProductImage src={v.image_url} />
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
      mobile: 'actions',
      align: 'right',
      render: (v) => (
        <div className={styles.actions}>
          <Button
            as={Link}
            to={`/admin/stock/variantes/${v.id_variante}`}
            variant="soft"
            size="sm"
          >
            Stock
          </Button>
          <Button variant="soft" size="sm" onClick={() => openEdit(v)}>
            Modifier
          </Button>
          <Button
            variant="soft"
            size="sm"
            onClick={() => handleToggleClick(v)}
            disabled={statutMutation.isPending}
          >
            {v.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}
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

    if (data.variantes.length === 0) {
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
      <DataTable
        caption="Liste des variantes du produit"
        columns={columns}
        rows={data.variantes}
        rowKey={(v) => v.id_variante}
      />
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