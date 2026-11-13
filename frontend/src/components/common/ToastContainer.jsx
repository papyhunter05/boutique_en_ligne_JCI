import styles from './ToastContainer.module.css'

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className={styles.container} aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
          role={toast.type === 'error' ? 'alert' : 'status'}
        >
          <p>{toast.message}</p>
          <button
            type="button"
            className={styles.close}
            onClick={() => onDismiss(toast.id)}
            aria-label="Fermer la notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}