import styles from './StatCard.module.css'

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconColor,
  isLoading = false,
  isError = false,
}) {
  return (
    <article className={styles.card}>
      <p className={styles.label}>{label}</p>

      {isLoading ? (
        <span className={styles.skeleton} aria-label="Chargement" />
      ) : (
        <p className={styles.value}>{isError ? '—' : value}</p>
      )}

      {(hint || isError) && (
        <p className={styles.hint}>{isError ? 'Donnée indisponible' : hint}</p>
      )}

      {Icon && (
        <Icon
          className={styles.decoration}
          size={84}
          stroke={1.5}
          color={iconColor}
          aria-hidden="true"
        />
      )}
    </article>
  )
}