import Button from '../ui/Button'
import ProductImage from './ProductImage'
import { formatPrix } from '../../utils/format'
import styles from './ProductCard.module.css'

// onSelect(idProduit) ouvre la fiche. showAddToCart : seulement pour un client connecté.
export default function ProductCard({ product, onSelect, showAddToCart = false }) {
  const open = onSelect ? () => onSelect(product.id_produit) : undefined
  const Main = open ? 'button' : 'div'
  const mainProps = open ? { type: 'button', onClick: open } : {}

  return (
    <article className={styles.card}>
      <Main className={`${styles.main} ${open ? styles.interactive : ''}`} {...mainProps}>
        <ProductImage src={product.image} />
        <span className={styles.name}>{product.nom_produit}</span>
        {product.description && <span className={styles.description}>{product.description}</span>}
        <span className={styles.price}>Prix : {formatPrix(product.prix)}</span>
      </Main>

      {showAddToCart && open && (
        <Button size="sm" fullWidth onClick={open} aria-label={`Ajouter ${product.nom_produit} au panier`}>
          Ajouter au panier
        </Button>
      )}
    </article>
  )
}