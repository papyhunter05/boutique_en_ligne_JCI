import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Select from '../ui/Select'
import QuantityStepper from '../ui/QuantityStepper'
import StateMessage from '../common/StateMessage'
import ProductImage from './ProductImage'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import { useProduitDetail } from '../../hooks/useProduitDetail'
import { useAddToPanier, usePanier } from '../../hooks/usePanier'
import { getFirstError, isUncertainError } from '../../utils/errors'
import { formatPrix } from '../../utils/format'
import { LOW_STOCK_THRESHOLD } from '../../utils/stock'
import {
  getModeleOptions,
  getTailleOptions,
  modeleKey,
  pickDefaultVariante,
} from '../../utils/variantes'
import styles from './ProductDetailModal.module.css'

function Loading() {
  return (
    <div className={styles.layout} aria-busy="true" aria-label="Chargement du produit">
      <div className={styles.media}>
        <span className={styles.skeletonImage} />
      </div>
      <div className={styles.info}>
        <span className={styles.skeletonLine} />
        <span className={styles.skeletonLine} />
        <span className={styles.skeletonLine} />
      </div>
    </div>
  )
}

function ProductDetailContent({ productId, onClose }) {
  const { isClient } = useAuth()
  const notify = useNotification()
  const { data: produit, isPending, isError, error, refetch } = useProduitDetail(productId)
  const panier = usePanier()
  const addMutation = useAddToPanier()

  const [selectedId, setSelectedId] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [formError, setFormError] = useState('')

  if (isPending) return <Loading />

  if (isError) {
    const unavailable = error?.response?.status === 404
    return (
      <StateMessage
        isError
        title={unavailable ? "Ce produit n'est plus disponible." : 'Impossible de charger ce produit.'}
        message={unavailable ? undefined : 'Vérifiez votre connexion puis réessayez.'}
        actionLabel={unavailable ? 'Fermer' : 'Réessayer'}
        onAction={unavailable ? onClose : () => refetch()}
      />
    )
  }

  const variantes = produit.variantes ?? []
  const selected = variantes.find((v) => v.id_variante === selectedId) ?? pickDefaultVariante(variantes)

  if (!selected) {
    return (
      <StateMessage
        title="Ce produit n'est pas disponible pour le moment."
        actionLabel="Fermer"
        onAction={onClose}
      />
    )
  }

  const modele = modeleKey(selected)
  const modeleOptions = getModeleOptions(variantes)
  const tailleOptions = getTailleOptions(variantes, modele)

  // Quantité déjà dans le panier : l'ajout s'additionne, il ne la remplace pas
  const inCart =
    panier.data?.articles?.find((a) => a.id_variante === selected.id_variante)?.quantite ?? 0
  const available = Math.max(0, selected.stock_disponible - inCart)
  const shownQuantity = Math.min(Math.max(1, quantity), Math.max(1, available))

  function chooseVariante(variante) {
    setSelectedId(variante.id_variante)
    setQuantity(1)
    setFormError('')
  }

  async function handleAdd() {
    setFormError('')
    try {
      await addMutation.mutateAsync({ id_variante: selected.id_variante, quantite: shownQuantity })
      notify.success(`${produit.nom_produit} ajouté au panier.`)
      onClose()
    } catch (err) {
      setFormError(
        isUncertainError(err)
          ? "La connexion a été interrompue. Vérifiez votre panier avant de réessayer, pour ne pas ajouter l'article deux fois."
          : getFirstError(err),
      )
    }
  }

  let stockHint = null
  if (available === 0) {
    stockHint =
      inCart > 0
        ? 'Vous avez déjà la quantité maximale disponible dans votre panier.'
        : 'Cet article est épuisé.'
  } else if (available <= LOW_STOCK_THRESHOLD) {
    stockHint = `Plus que ${available} en stock.`
  } else if (inCart > 0) {
    stockHint = `Vous en avez déjà ${inCart} dans votre panier.`
  }

  return (
    <div className={styles.layout}>
      <div className={styles.media}>
        <ProductImage src={selected.image_url} alt={produit.nom_produit} />
      </div>

      <div className={styles.info}>
        <p className={styles.eyebrow}>Collection JCI Madagascar</p>
        <h2 className={styles.name}>{produit.nom_produit}</h2>
        {produit.description && <p className={styles.description}>{produit.description}</p>}
        <p className={styles.price}>{formatPrix(produit.prix)}</p>

        <div className={styles.fields}>
          {modeleOptions.length > 0 && (
            <Select
              label="Modèle"
              options={modeleOptions}
              value={modele}
              onChange={(event) => chooseVariante(pickDefaultVariante(variantes, event.target.value))}
            />
          )}

          {tailleOptions.length > 0 && (
            <Select
              label="Taille"
              options={tailleOptions}
              value={String(selected.id_variante)}
              onChange={(event) =>
                chooseVariante(variantes.find((v) => String(v.id_variante) === event.target.value))
              }
            />
          )}

          {isClient ? (
            <>
              <div className={styles.quantityRow}>
                <span className={styles.quantityLabel} id="quantity-label">
                  Quantité
                </span>
                <QuantityStepper
                  value={shownQuantity}
                  min={1}
                  max={available}
                  disabled={available === 0 || addMutation.isPending}
                  onChange={setQuantity}
                />
              </div>

              {stockHint && <p className={styles.hint}>{stockHint}</p>}

              {formError && (
                <p role="alert" className={styles.formError}>
                  {formError}
                </p>
              )}

              <Button
                size="lg"
                fullWidth
                onClick={handleAdd}
                loading={addMutation.isPending}
                disabled={available === 0}
              >
                {available === 0 && inCart === 0 ? 'Épuisé' : 'Ajouter au panier'}
              </Button>
            </>
          ) : (
            <p className={styles.hint}>Les comptes administrateurs ne peuvent pas passer commande.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailModal({ isOpen, productId, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" padded={false} ariaLabel="Détail du produit">
      {productId && <ProductDetailContent key={productId} productId={productId} onClose={onClose} />}
    </Modal>
  )
}