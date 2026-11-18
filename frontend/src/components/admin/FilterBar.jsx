import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import styles from './FilterBar.module.css'

export default function FilterBar({ children, hasActiveFilters, onReset, summary }) {
  return (
    <div className={styles.bar} role="search" aria-label="Filtres du tableau">
      <div className={styles.fields}>{children}</div>

      <div className={styles.footer}>
        <p className={styles.summary} aria-live="polite">
          {summary}
        </p>
        {hasActiveFilters && (
          <Button variant="soft" size="sm" onClick={onReset}>
            Réinitialiser les filtres
          </Button>
        )}
      </div>
    </div>
  )
}

export function SearchFilter({ value, onChange, placeholder = 'Rechercher…' }) {
  return (
    <Input
      className={styles.search}
      label="Rechercher"
      type="search"
      autoComplete="off"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}

export function SelectFilter({ label, value, onChange, options, placeholder }) {
  return (
    <Select
      label={label}
      placeholder={placeholder}
      options={options}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}

export function DateFilter({ label, value, onChange, min, max }) {
  return (
    <Input
      label={label}
      type="date"
      min={min}
      max={max}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}