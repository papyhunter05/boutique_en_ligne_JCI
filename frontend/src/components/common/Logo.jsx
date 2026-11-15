import logoUrl from '../../assets/icons/jci_logo_color.png'
import styles from './Logo.module.css'

export default function Logo({ subtitle = 'Boutique officielle' }) {
  return (
    <div className={styles.logo}>
      <img src={logoUrl} alt="JCI Madagascar" className={styles.image} />
      <span className={styles.separator} aria-hidden="true" />
      <span className={styles.text}>
        <strong>JCI Madagascar</strong>
        <small>{subtitle}</small>
      </span>
    </div>
  )
}