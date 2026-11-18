import styles from './CheckoutStepper.module.css'

const STEPS = ['Panier', 'Informations', 'Récapitulatif', 'Paiement', 'Confirmation']

export default function CheckoutStepper({ current }) {
  return (
    <nav aria-label="Étapes de la commande">
      <ol className={styles.steps}>
        {STEPS.map((label, index) => {
          const number = index + 1
          const state = number === current ? 'current' : number < current ? 'done' : 'todo'
          return (
            <li
              key={label}
              className={`${styles.step} ${styles[state]}`}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <span className={styles.circle}>{number}</span>
              <span className={styles.label}>{label}</span>
              {number < STEPS.length && (
                <span
                  className={`${styles.line} ${number <= current ? styles.lineActive : ''}`}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}