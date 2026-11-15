import Button from '../ui/Button'
import styles from './Pagination.module.css'

export default function Pagination({
  page,
  lastPage,
  onChange,
  disabled = false,
  label = 'Pagination',
}) {
  if (!lastPage || lastPage <= 1) return null

  return (
    <nav className={styles.pagination} aria-label={label}>
      <Button
        variant="soft"
        size="sm"
        onClick={() => onChange(page - 1)}
        disabled={disabled || page <= 1}
      >
        Précédent
      </Button>
      <span className={styles.info} aria-current="page">
        Page {page} sur {lastPage}
      </span>
      <Button
        variant="soft"
        size="sm"
        onClick={() => onChange(page + 1)}
        disabled={disabled || page >= lastPage}
      >
        Suivant
      </Button>
    </nav>
  )
}