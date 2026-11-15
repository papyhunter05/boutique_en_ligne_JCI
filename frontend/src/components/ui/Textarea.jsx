import { forwardRef, useId } from 'react'
import styles from './Input.module.css'

const Textarea = forwardRef(function Textarea(
  { label, error, hint, rows = 3, id, className = '', ...rest },
  ref,
) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const messageId = error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined

  return (
    <div className={`${styles.field} ${className}`}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`${styles.input} ${error ? styles.invalid : ''}`}
        style={{ resize: 'vertical' }}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={messageId}
        {...rest}
      />

      {error ? (
        <p id={messageId} role="alert" className={styles.error}>{error}</p>
      ) : hint ? (
        <p id={messageId} className={styles.hint}>{hint}</p>
      ) : null}
    </div>
  )
})

export default Textarea