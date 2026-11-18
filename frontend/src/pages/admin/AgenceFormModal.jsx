import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import { useCreateAgence, useUpdateAgence } from '../../hooks/useAdminAgences'
import { useNotification } from '../../hooks/useNotification'
import { applyServerErrors } from '../../utils/errors'
import styles from './AgenceFormModal.module.css'

const optionalEmail = z
  .string()
  .trim()
  .max(250, '250 caractères maximum')
  .refine((value) => value === '' || z.string().email().safeParse(value).success, 'Adresse email invalide')

const schema = z.object({
  nom_agence: z.string().trim().min(1, "Le nom de l'agence est obligatoire").max(150, '150 caractères maximum'),
  telephone: z.string().trim().max(20, '20 caractères maximum'),
  adresse: z.string().trim().min(1, "L'adresse est obligatoire"),
  ville: z.string().trim().min(1, 'La ville est obligatoire').max(100, '100 caractères maximum'),
  mail: optionalEmail,
})

const FIELDS = ['nom_agence', 'telephone', 'adresse', 'ville', 'mail']

// Champs réellement modifiés par rapport à l'agence d'origine
function getChanges(agence, values) {
  const changes = {}
  FIELDS.forEach((field) => {
    if ((agence[field] ?? '') !== values[field]) changes[field] = values[field]
  })
  return changes
}

function AgenceForm({ agence, onClose }) {
  const isEdit = Boolean(agence)
  const notify = useNotification()
  const createMutation = useCreateAgence()
  const updateMutation = useUpdateAgence()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nom_agence: agence?.nom_agence ?? '',
      telephone: agence?.telephone ?? '',
      adresse: agence?.adresse ?? '',
      ville: agence?.ville ?? '',
      mail: agence?.mail ?? '',
    },
  })

  async function submit(values) {
    try {
      if (isEdit) {
        const changes = getChanges(agence, values)
        // Le backend refuse une requête vide : on n'envoie rien s'il n'y a pas de changement
        if (Object.keys(changes).length === 0) {
          notify.info('Aucune modification à enregistrer.')
          onClose()
          return
        }
        await updateMutation.mutateAsync({ id: agence.id, ...changes })
        notify.success('Agence modifiée.')
      } else {
        await createMutation.mutateAsync(values)
        notify.success('Agence ajoutée.')
      }
      onClose()
    } catch (error) {
      applyServerErrors(error, setError, FIELDS)
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className={styles.form}>
      <Input
        label="Nom de l'agence"
        data-autofocus
        error={errors.nom_agence?.message}
        {...register('nom_agence')}
      />

      <div className={styles.row}>
        <Input label="Ville" error={errors.ville?.message} {...register('ville')} />
        <Input
          label="Téléphone (facultatif)"
          type="tel"
          autoComplete="off"
          error={errors.telephone?.message}
          {...register('telephone')}
        />
      </div>

      <Textarea label="Adresse" rows={2} error={errors.adresse?.message} {...register('adresse')} />

      <Input
        label="Email (facultatif)"
        type="email"
        autoComplete="off"
        error={errors.mail?.message}
        {...register('mail')}
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
          {isEdit ? 'Enregistrer' : 'Ajouter'}
        </Button>
      </div>
    </form>
  )
}

// agence = null → création, sinon modification
export default function AgenceFormModal({ isOpen, agence, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={agence ? "Modifier l'agence" : 'Ajouter une agence'}
    >
      <AgenceForm agence={agence} onClose={onClose} />
    </Modal>
  )
}