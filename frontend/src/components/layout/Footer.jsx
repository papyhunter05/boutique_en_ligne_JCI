import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <p className={styles.label}>JCI MADAGASCAR</p>
          <p className={styles.slogan}>
            UNE BOUTIQUE QUI NOUS <br /> RASSEMBLE.
          </p>
        </div>
        <p className={styles.text}>
          Chaque achat soutient la visibilité et les actions de la Jeune Chambre
          Internationale de Madagascar. Merci de faire vivre nos couleurs.
        </p>
      </div>
    </footer>
  )
}