import styles from './InfoList.module.css'

// Les valeurs vides sont ignorées
export default function InfoList({ items }) {
  const visible = items.filter(
    (item) => item.value !== null && item.value !== undefined && item.value !== '',
  )
  if (visible.length === 0) return <p className={styles.empty}>Aucune information.</p>

  return (
    <dl className={styles.info}>
      {visible.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}