import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { IconArrowLeft, IconArrowRight } from '../../components/ui/tablerIcons'
import CheckoutStepper from '../../components/shop/CheckoutStepper'
import CartItem from '../../components/shop/CartItem'
import OrderSummary from '../../components/shop/OrderSummary'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import StateMessage from '../../components/common/StateMessage'
import {
  useClearPanier,
  usePanier,
  useRemovePanierArticle,
  useUpdatePanierArticle,
} from '../../hooks/usePanier'
import { useNotification } from '../../hooks/useNotification'
import { getFirstError } from '../../utils/errors'
import { pluralize } from '../../utils/format'
import styles from './CartPage.module.css'

const EMPTY = []

export default function CartPage() {
  const notify = useNotification()
  const { data: panier, isPending, isError, refetch } = usePanier()
  const updateMutation = useUpdatePanierArticle()
  const removeMutation = useRemovePanierArticle()
  const clearMutation = useClearPanier()
  const [clearOpen, setClearOpen] = useState(false)

  const articles = panier?.articles ?? EMPTY
  const units = articles.reduce((sum, article) => sum + article.quantite, 0)
  const hasProblem = articles.some((article) => article.quantite > article.stock_disponible)
  const busy = updateMutation.isPending || removeMutation.isPending || clearMutation.isPending

  async function changeQuantity(item, quantite) {
    try {
      await updateMutation.mutateAsync({ id: item.id_panier_article, quantite })
    } catch (error) {
      notify.error(getFirstError(error)) // le panier est rechargé : la quantité redevient celle du serveur
    }
  }

  async function removeItem(item) {
    try {
      await removeMutation.mutateAsync(item.id_panier_article)
      notify.success(`« ${item.nom_produit} » retiré du panier.`)
    } catch (error) {
      notify.error(getFirstError(error))
    }
  }

  async function confirmClear() {
    try {
      await clearMutation.mutateAsync()
      notify.success('Votre panier a été vidé.')
    } catch (error) {
      notify.error(getFirstError(error))
    }
    setClearOpen(false)
  }

  // PROVISOIRE : l'étape « Informations » (mode de réception, adresse) arrive à l'étape 6c.
  function handleCheckout() {
    notify.info("L'étape suivante sera disponible prochainement.")
  }

  function renderItems() {
    if (isPending) {
      return (
        <div className={styles.skeletons} aria-busy="true" aria-label="Chargement du panier">
          {Array.from({ length: 2 }, (_, i) => (
            <span key={i} className={styles.skeleton} />
          ))}
        </div>
      )
    }

    if (isError && !panier) {
      return (
        <StateMessage
          isError
          title="Impossible de charger votre panier."
          message="Vérifiez votre connexion puis réessayez."
          actionLabel="Réessayer"
          onAction={() => refetch()}
        />
      )
    }

    if (articles.length === 0) {
      return (
        <StateMessage
          title="Votre panier est vide."
          message="Ajoutez des articles depuis la boutique."
        />
      )
    }

    return (
      <>
        <ul className={styles.list}>
          {articles.map((article) => (
            <CartItem
              key={article.id_panier_article}
              item={article}
              busy={busy}
              onQuantityChange={changeQuantity}
              onRemove={removeItem}
            />
          ))}
        </ul>
        <button type="button" className={styles.clear} onClick={() => setClearOpen(true)} disabled={busy}>
          Vider le panier
        </button>
      </>
    )
  }

  return (
    <div className={styles.page}>
      <CheckoutStepper current={1} />

      <div className={styles.grid}>
        <section className={styles.card} aria-labelledby="cart-title">
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Étape 1</p>
              <h1 id="cart-title" className={styles.title}>
                Votre panier
              </h1>
            </div>
            {articles.length > 0 && <span className={styles.badge}>{pluralize(units, 'article')}</span>}
          </header>

          {renderItems()}

          <footer className={styles.footer}>
            <Button as={Link} to="/" variant="soft" leftIcon={<IconArrowLeft size={16} />}>
              Continuer mes achats
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={articles.length === 0 || hasProblem || busy}
              rightIcon={<IconArrowRight size={16} />}
            >
              Passer à la commande
            </Button>
          </footer>

          {hasProblem && (
            <p role="alert" className={styles.problem}>
              Corrigez les quantités signalées ci-dessus pour continuer.
            </p>
          )}
        </section>

        <OrderSummary articles={articles} subtotal={panier?.total ?? 0} />
      </div>

      <ConfirmDialog
        isOpen={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={confirmClear}
        loading={clearMutation.isPending}
        title="Vider le panier ?"
        message="Tous les articles seront retirés de votre panier."
        confirmLabel="Vider le panier"
        confirmVariant="danger"
      />
    </div>
  )
}