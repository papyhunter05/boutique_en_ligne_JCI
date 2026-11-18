import { useEffect, useId, useRef, useState } from 'react'
import { CloseIcon } from './icons'
import styles from './Modal.module.css'

// Doit correspondre à la durée des animations dans Modal.module.css
const ANIMATION_MS = 200
// Nombre de modales affichées : le défilement de la page n'est rendu qu'à la fermeture de la dernière
let openModals = 0
let savedOverflow = ''

export default function Modal({
  isOpen,
  onClose,
  title,
  ariaLabel,            // obligatoire si pas de title
  size = 'md',          // sm | md | lg
  padded = true,        // false : le contenu gère lui-même ses marges
  showCloseButton = true,
  children,
}) {
  const dialogRef = useRef(null)
  const titleId = useId()

  // Le contenu reste affiché pendant l'animation de fermeture,
  // puis disparaît pour que les formulaires repartent vides à la réouverture.
  const [hasContent, setHasContent] = useState(isOpen)
  if (isOpen && !hasContent) setHasContent(true) // ajustement pendant le rendu, autorisé par React

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      dialog.dataset.state = 'open'
      if (!dialog.open) {
        dialog.showModal()
        // Un élément marqué data-autofocus reçoit le focus en premier
        dialog.querySelector('[data-autofocus]')?.focus()
      }
      return
    }

    if (!dialog.open) return

    // Fermeture : on joue l'animation de sortie, puis on ferme pour de bon
    dialog.dataset.state = 'closing'
    const timer = setTimeout(() => {
      dialog.close()
      delete dialog.dataset.state
      setHasContent(false)
    }, ANIMATION_MS)

    // Réouverture pendant l'animation : on annule la fermeture
    return () => clearTimeout(timer)
  }, [isOpen])

  // Bloque le défilement de la page tant qu'une modale est à l'écran
  useEffect(() => {
    if (!hasContent) return
    if (openModals === 0) savedOverflow = document.body.style.overflow
    openModals += 1
    document.body.style.overflow = 'hidden'
    return () => {
      openModals -= 1
      if (openModals === 0) document.body.style.overflow = savedOverflow
    }
  }, [hasContent])

  // Touche Échap
  function handleCancel(event) {
    event.preventDefault()
    onClose()
  }

  // Clic sur le fond assombri
  function handleClick(event) {
    if (event.target === dialogRef.current) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} ${styles[size]}`}
      onCancel={handleCancel}
      onClick={handleClick}
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : ariaLabel}
    >
      {hasContent && (
        <div className={styles.content}>
          {showCloseButton && (
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label="Fermer"
            >
              <CloseIcon />
            </button>
          )}
          {title && (
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
          )}
          <div className={padded ? styles.body : undefined}>{children}</div>
        </div>
      )}
    </dialog>
  )
}