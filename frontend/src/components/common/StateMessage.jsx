import Button from '../ui/Button'
import styles from './StateMessage.module.css'

export default function StateMessage({ title, message, actionLabel, onAction, isError = false }) {
  return (
    <div className={styles.box} role={isError ? 'alert' : undefined}>
      <p className={styles.title}>{title}</p>
      {message && <p className={styles.message}>{message}</p>}
      {actionLabel && (
        <Button variant="soft" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}