import ProductImage from './ProductImage'
import QuantityStepper from '../ui/QuantityStepper'
import { IconTrash } from '../ui/tablerIcons'
import { formatPrix } from '../../utils/format'
import styles from './CartItem.module.css'

// Aucun SKU affiché : le client n'en a pas besoin
export default function CartItem({ item, busy, onQuantityChange, onRemove }) {
  const stock = item.stock_disponible
  const shortage = item.quantite > stock

  const details = [
    item.modele,
    item.taille ? `Taille ${item.taille}` : null,
    formatPrix(item.prix_unitaire),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <li className={styles.item}>
      <div className={styles.thumb}>
        <ProductImage src={item.image_url} alt="" />
      </div>

      <div className={styles.main}>
        <p className={styles.name}>{item.nom_produit}</p>
        <p className={styles.details}>{details}</p>
        <QuantityStepper
          value={item.quantite}
          min={1}
          max={stock}
          disabled={busy}
          onChange={(quantite) => onQuantityChange(item, quantite)}
        />
        {shortage && (
          <p role="alert" className={styles.warning}>
            {stock <= 0
              ? "Cet article n'est plus en stock. Retirez-le pour continuer."
              : `Stock insuffisant : ${stock} disponible${stock > 1 ? 's' : ''}. Réduisez la quantité.`}
          </p>
        )}
      </div>

      <div className={styles.side}>
        <strong className={styles.total}>{formatPrix(item.sous_total)}</strong>
        <button
          type="button"
          className={styles.remove}
          onClick={() => onRemove(item)}
          disabled={busy}
          aria-label={`Retirer ${item.nom_produit} du panier`}
        >
          <IconTrash size={18} />
        </button>
      </div>
    </li>
  )
}