import logoUrl from '../../assets/icons/jci_logo_color.png'
import styles from './Logo.module.css'

// À remplacer par <img src={logo} alt="JCI Madagascar" /> quand tu auras
// placé le fichier dans src/assets/images/ (import logo from '../../assets/images/logo.svg').
export default function Logo() {
  return (
    <div className={styles.logo}>
      <img src={logoUrl} alt="JCI Madagascar" className={styles.image} />
      <span className={styles.separator} aria-hidden="true" />
      <span className={styles.text}>
        <strong>JCI Madagascar</strong>
        <small>Boutique officielle</small>
      </span>
    </div>
  )
}