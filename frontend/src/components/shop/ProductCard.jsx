import Button from '../ui/Button'
import ProductImage from './ProductImage'
import { formatPrix } from '../../utils/format'
import styles from './ProductCard.module.css'

export default function ProductCard({ product, onSelect, onAddToCart }) {
  const Main = onSelect ? 'button' : 'div'
  const mainProps = onSelect ? { type: 'button', onClick: onSelect } : {}

  return (
    <article className={styles.card}>
      <Main className={`${styles.main} ${onSelect ? styles.interactive : ''}`} {...mainProps}>
        <ProductImage src={product.image} />
        <span className={styles.name}>{product.nom_produit}</span>
        {product.description && <span className={styles.description}>{product.description}</span>}
        <span className={styles.price}>Prix : {formatPrix(product.prix)}</span>
      </Main>

      {onAddToCart && (
        <Button
          size="sm"
          fullWidth
          onClick={onAddToCart}
          aria-label={`Ajouter ${product.nom_produit} au panier`}
        >
          Ajouter au panier
        </Button>
      )}
    </article>
  )
}