import Modal from '../ui/Modal'
import Button from '../ui/Button'
import styles from './ConfirmDialog.module.css'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  confirmVariant = 'primary', // 'danger' pour une suppression
  loading = false,
}) {
  // Pendant l'opération, on empêche de fermer par Échap ou clic sur le fond
  function handleClose() {
    if (!loading) onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <p className={styles.message}>{message}</p>

      <div className={styles.actions}>
        {/* data-autofocus : « Annuler » est sélectionné par défaut, c'est le choix le plus sûr */}
        <Button variant="soft" onClick={handleClose} disabled={loading} data-autofocus>
          {cancelLabel}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}