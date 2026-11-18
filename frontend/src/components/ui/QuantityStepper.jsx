import { IconMinus, IconPlus } from './tablerIcons'
import styles from './QuantityStepper.module.css'

export default function QuantityStepper({
  value,
  min = 1,
  max = Infinity,
  onChange,
  disabled = false,
  label = 'Quantité',
}) {
  return (
    <div className={styles.stepper} role="group" aria-label={label}>
      <button
        type="button"
        className={styles.button}
        // Si la quantité dépasse déjà le maximum, un clic ramène directement dans la limite
        onClick={() => onChange(Math.min(value - 1, max))}
        disabled={disabled || value <= min}
        aria-label="Diminuer la quantité"
      >
        <IconMinus size={16} />
      </button>
      <output className={styles.value} aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label="Augmenter la quantité"
      >
        <IconPlus size={16} />
      </button>
    </div>
  )
}