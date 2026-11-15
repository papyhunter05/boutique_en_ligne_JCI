import { useState } from 'react'
import styles from './ProductImage.module.css'

export default function ProductImage({ src, alt = '' }) {
  // On mémorise l'URL qui a échoué : si la source change, la nouvelle est retentée
  const [failedSrc, setFailedSrc] = useState(null)
  const showImage = Boolean(src) && failedSrc !== src

  return (
    <div className={styles.frame}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={styles.image}
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span className={styles.placeholder}>Image indisponible</span>
      )}
    </div>
  )
}