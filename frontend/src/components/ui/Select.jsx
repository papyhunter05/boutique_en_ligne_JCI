import { forwardRef, useId } from 'react'
import styles from './Input.module.css'

// options : [{ value, label }]
const Select = forwardRef(function Select(
  { label, error, hint, placeholder, options, id, className = '', ...rest },
  ref,
) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const messageId = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined

  return (
    <div className={`${styles.field} ${className}`}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}

      <select
        ref={ref}
        id={selectId}
        className={`${styles.input} ${error ? styles.invalid : ''}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={messageId}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error ? (
        <p id={messageId} role="alert" className={styles.error}>{error}</p>
      ) : hint ? (
        <p id={messageId} className={styles.hint}>{hint}</p>
      ) : null}
    </div>
  )
})

export default Select