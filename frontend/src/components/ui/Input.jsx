import { forwardRef, useId, useState } from 'react'
import { EyeIcon, EyeOffIcon } from './icons'
import styles from './Input.module.css'

// forwardRef est nécessaire pour que React Hook Form puisse lire la valeur :
// <Input label="Email" error={errors.email?.message} {...register('email')} />
const Input = forwardRef(function Input(
  { label, error, hint, type = 'text', id, className = '', ...rest },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  const messageId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  const inputClasses = [
    styles.input,
    error ? styles.invalid : '',
    isPassword ? styles.withToggle : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`${styles.field} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}

      <div className={styles.control}>
        <input
          ref={ref}
          id={inputId}
          type={isPassword && showPassword ? 'text' : type}
          className={inputClasses}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={messageId}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>

      {error ? (
        <p id={messageId} role="alert" className={styles.error}>{error}</p>
      ) : hint ? (
        <p id={messageId} className={styles.hint}>{hint}</p>
      ) : null}
    </div>
  )
})

export default Input