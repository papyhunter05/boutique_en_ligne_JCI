import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import { applyServerErrors } from '../../utils/errors'
import styles from './AuthModal.module.css'

const schema = z
  .object({
    nom: z.string().trim().min(1, 'Le nom est obligatoire').max(100, '100 caractères maximum'),
    prenom: z.string().trim().min(1, 'Le prénom est obligatoire').max(100, '100 caractères maximum'),
    email: z
      .string()
      .trim()
      .min(1, "L'adresse email est obligatoire")
      .email('Adresse email invalide'),
    telephone: z
      .string()
      .trim()
      .min(1, 'Le téléphone est obligatoire')
      .regex(/^\+?[0-9 ]{9,16}$/, 'Numéro de téléphone invalide'),
    mot_de_passe: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    mot_de_passe_confirmation: z.string().min(1, 'Veuillez confirmer le mot de passe'),
  })
  .refine((data) => data.mot_de_passe === data.mot_de_passe_confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['mot_de_passe_confirmation'],
  })

const FIELDS = [
  'nom',
  'prenom',
  'email',
  'telephone',
  'mot_de_passe',
  'mot_de_passe_confirmation',
]

export default function RegisterForm({ onSuccess }) {
  const { register: registerUser } = useAuth()
  const notify = useNotification()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      mot_de_passe: '',
      mot_de_passe_confirmation: '',
    },
  })

  async function submit(values) {
    try {
      const utilisateur = await registerUser({
        ...values,
        telephone: values.telephone.replace(/\s/g, ''),
      })
      notify.success(`Compte créé. Bienvenue ${utilisateur.prenom} !`)
      onSuccess(utilisateur)
    } catch (error) {
      applyServerErrors(error, setError, FIELDS)
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className={styles.form}>
      <div className={styles.row}>
        <Input
          label="Nom"
          autoComplete="family-name"
          error={errors.nom?.message}
          {...register('nom')}
        />
        <Input
          label="Prénom"
          autoComplete="given-name"
          error={errors.prenom?.message}
          {...register('prenom')}
        />
      </div>
      <Input
        label="Adresse email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Téléphone"
        type="tel"
        autoComplete="tel"
        placeholder="034 00 000 00"
        error={errors.telephone?.message}
        {...register('telephone')}
      />
      <Input
        label="Mot de passe"
        type="password"
        autoComplete="new-password"
        error={errors.mot_de_passe?.message}
        {...register('mot_de_passe')}
      />
      <Input
        label="Confirmer le mot de passe"
        type="password"
        autoComplete="new-password"
        error={errors.mot_de_passe_confirmation?.message}
        {...register('mot_de_passe_confirmation')}
      />

      {errors.root && (
        <p role="alert" className={styles.formError}>
          {errors.root.message}
        </p>
      )}

      <Button type="submit" variant="success" fullWidth loading={isSubmitting}>
        Créer mon compte
      </Button>
    </form>
  )
}