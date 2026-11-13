import styles from './StatusBadge.module.css'

// tone : success | warning | info | neutral | danger
export default function StatusBadge({ tone = 'neutral', children }) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      <span className={styles.dot} aria-hidden="true" />
      {children}
    </span>
  )
}