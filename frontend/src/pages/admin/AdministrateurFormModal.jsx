import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useCreateAdmin } from '../../hooks/useAdminUtilisateurs'
import { useNotification } from '../../hooks/useNotification'
import { applyServerErrors } from '../../utils/errors'
import styles from './AdministrateurFormModal.module.css'

// Mêmes règles que le backend (storeAdmin). Les mots de passe ne passent jamais par .trim().
const schema = z
  .object({
    nom: z.string().trim().min(1, 'Le nom est obligatoire').max(100, '100 caractères maximum'),
    prenom: z.string().trim().min(1, 'Le prénom est obligatoire').max(100, '100 caractères maximum'),
    email: z
      .string()
      .trim()
      .min(1, "L'adresse email est obligatoire")
      .max(150, '150 caractères maximum')
      .email('Adresse email invalide'),
    telephone: z
      .string()
      .trim()
      .min(1, 'Le téléphone est obligatoire')
      .max(20, '20 caractères maximum')
      .regex(/^\+?[0-9 ]+$/, 'Numéro de téléphone invalide'),
    mot_de_passe: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    mot_de_passe_confirmation: z.string().min(1, 'Veuillez confirmer le mot de passe'),
  })
  .refine((data) => data.mot_de_passe === data.mot_de_passe_confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['mot_de_passe_confirmation'],
  })

const FIELDS = ['nom', 'prenom', 'email', 'telephone', 'mot_de_passe', 'mot_de_passe_confirmation']

function AdministrateurForm({ onClose }) {
  const notify = useNotification()
  const createMutation = useCreateAdmin()

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
      await createMutation.mutateAsync({
        ...values,
        telephone: values.telephone.replace(/\s/g, ''),
      })
      notify.success(`Compte administrateur créé pour ${values.prenom} ${values.nom}.`)
      // La modale se ferme et son contenu est détruit : les mots de passe ne restent pas en mémoire
      onClose()
    } catch (error) {
      applyServerErrors(error, setError, FIELDS)
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className={styles.form} autoComplete="off">
      <p className={styles.note}>
        Ce compte sera créé avec le rôle <strong>Administrateur</strong>. Les emails automatiques
        ne sont pas encore en place : communiquez le mot de passe à la personne de façon
        sécurisée.
      </p>

      <div className={styles.row}>
        <Input
          label="Nom"
          autoComplete="off"
          data-autofocus
          error={errors.nom?.message}
          {...register('nom')}
        />
        <Input
          label="Prénom"
          autoComplete="off"
          error={errors.prenom?.message}
          {...register('prenom')}
        />
      </div>

      <Input
        label="Adresse email"
        type="email"
        autoComplete="off"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Téléphone"
        type="tel"
        autoComplete="off"
        placeholder="034 00 000 00"
        error={errors.telephone?.message}
        {...register('telephone')}
      />
      <Input
        label="Mot de passe"
        type="password"
        autoComplete="new-password"
        hint="8 caractères minimum."
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

      <div className={styles.actions}>
        <Button variant="soft" onClick={onClose} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" variant="accent" loading={isSubmitting}>
          Créer l'administrateur
        </Button>
      </div>
    </form>
  )
}

export default function AdministrateurFormModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title="Créer un administrateur">
      <AdministrateurForm onClose={onClose} />
    </Modal>
  )
}