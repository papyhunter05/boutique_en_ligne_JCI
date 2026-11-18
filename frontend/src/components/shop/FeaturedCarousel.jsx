import { useState } from 'react'
import ProductImage from './ProductImage'
import { ChevronLeftIcon, ChevronRightIcon } from '../ui/icons'
import styles from './FeaturedCarousel.module.css'

export default function FeaturedCarousel({ products, onSelect }) {
  const [index, setIndex] = useState(0)
  const count = products.length
  if (count === 0) return null

  // Le modulo évite tout débordement si la liste change de taille
  const current = products[index % count]

  const previous = () => setIndex((i) => (i - 1 + count) % count)
  const next = () => setIndex((i) => (i + 1) % count)

  const Picture = onSelect ? 'button' : 'div'
  const pictureProps = onSelect
    ? { type: 'button', onClick: () => onSelect(current.id_produit), 'aria-label': `Voir ${current.nom_produit}` }
    : {}

  return (
    <section
      className={styles.carousel}
      aria-roledescription="carrousel"
      aria-label="Produits à la une"
    >
      <div className={styles.frame}>
        <Picture className={styles.picture} {...pictureProps}>
          <ProductImage src={current.image} />
        </Picture>

        {count > 1 && (
          <>
            <button
              type="button"
              className={`${styles.arrow} ${styles.left}`}
              onClick={previous}
              aria-label="Produit précédent"
            >
              <ChevronLeftIcon size={16} />
            </button>
            <button
              type="button"
              className={`${styles.arrow} ${styles.right}`}
              onClick={next}
              aria-label="Produit suivant"
            >
              <ChevronRightIcon size={16} />
            </button>
          </>
        )}
      </div>

      <div className={styles.caption} aria-live="polite">
        <p className={styles.name}>{current.nom_produit}</p>
        {current.description && <p className={styles.description}>{current.description}</p>}
      </div>
    </section>
  )
}