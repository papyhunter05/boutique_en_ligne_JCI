import styles from './Button.module.css'

export default function Button({
  as: Component = 'button', // 'button' par défaut, ou Link de React Router
  variant = 'primary',      // primary | dark | success | accent | soft | danger | slate
  size = 'md',
  pill = false,
  fullWidth = false,
  loading = false,
  leftIcon = null,
  rightIcon = null,
  type = 'button',
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    pill ? styles.pill : '',
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // Ces attributs n'existent que sur un vrai <button>
  const buttonProps =
    Component === 'button'
      ? { type, disabled: disabled || loading, 'aria-busy': loading || undefined }
      : {}

  return (
    <Component className={classes} {...buttonProps} {...rest}>
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : leftIcon}
      <span>{children}</span>{rightIcon}
    </Component>
  )
}