import { useEffect, useId, useMemo } from 'react'
import ProductImage from '../shop/ProductImage'
import styles from './ImageField.module.css'

// Champ fichier avec aperçu. La validation du fichier est faite par le parent.
export default function ImageField({ label, currentUrl, file, onFileChange, error, hint }) {
  const id = useId()
  const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  // Aperçu local du fichier choisi, libéré quand il change ou à la fermeture
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleChange(event) {
    const selected = event.target.files?.[0] ?? null
    onFileChange(selected)
    event.target.value = '' // permet de choisir deux fois le même fichier
  }

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>

      <div className={styles.row}>
        <div className={styles.preview}>
          <ProductImage src={previewUrl ?? currentUrl} />
        </div>

        <div className={styles.picker}>
          <input
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={styles.input}
            onChange={handleChange}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={messageId}
          />
          {file && <p className={styles.fileName}>{file.name}</p>}
        </div>
      </div>

      {error ? (
        <p id={messageId} role="alert" className={styles.error}>{error}</p>
      ) : hint ? (
        <p id={messageId} className={styles.hint}>{hint}</p>
      ) : null}
    </div>
  )
}