import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import { applyServerErrors } from '../../utils/errors'
import styles from './AuthModal.module.css'

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "L'adresse email est obligatoire")
    .email('Adresse email invalide'),
  mot_de_passe: z.string().min(1, 'Le mot de passe est obligatoire'),
})

const FIELDS = ['email', 'mot_de_passe']

export default function LoginForm({ onSuccess }) {
  const { login } = useAuth()
  const notify = useNotification()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', mot_de_passe: '' },
  })

  async function submit(values) {
    try {
      const utilisateur = await login(values)
      notify.success(`Bienvenue ${utilisateur.prenom} !`)
      onSuccess(utilisateur)
    } catch (error) {
      applyServerErrors(error, setError, FIELDS)
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className={styles.form}>
      <Input
        label="Adresse email"
        type="email"
        autoComplete="email"
        placeholder="vous@exemple.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Mot de passe"
        type="password"
        autoComplete="current-password"
        error={errors.mot_de_passe?.message}
        {...register('mot_de_passe')}
      />

      {errors.root && (
        <p role="alert" className={styles.formError}>
          {errors.root.message}
        </p>
      )}

      <Button type="submit" variant="success" fullWidth loading={isSubmitting}>
        Se connecter
      </Button>
    </form>
  )
}