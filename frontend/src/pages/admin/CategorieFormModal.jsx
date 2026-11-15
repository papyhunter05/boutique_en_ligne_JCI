import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import { useCreateCategorie, useUpdateCategorie } from '../../hooks/useAdminCategories'
import { useNotification } from '../../hooks/useNotification'
import { applyServerErrors } from '../../utils/errors'
import styles from './CategorieFormModal.module.css'

const schema = z.object({
  nom_categorie: z.string().trim().min(1, 'Le nom est obligatoire'),
  description: z.string().trim(),
})

const FIELDS = ['nom_categorie', 'description']

function CategorieForm({ categorie, onClose }) {
  const isEdit = Boolean(categorie)
  const notify = useNotification()
  const createMutation = useCreateCategorie()
  const updateMutation = useUpdateCategorie()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nom_categorie: categorie?.nom_categorie ?? '',
      description: categorie?.description ?? '',
    },
  })

  async function submit(values) {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: categorie.id_categorie, ...values })
        notify.success('Catégorie modifiée.')
      } else {
        await createMutation.mutateAsync(values)
        notify.success('Catégorie ajoutée.')
      }
      onClose()
    } catch (error) {
      applyServerErrors(error, setError, FIELDS)
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className={styles.form}>
      <Input
        label="Nom de la catégorie"
        data-autofocus
        error={errors.nom_categorie?.message}
        {...register('nom_categorie')}
      />
      <Textarea
        label="Description (facultative)"
        error={errors.description?.message}
        {...register('description')}
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

// categorie = null → création, sinon modification
export default function CategorieFormModal({ isOpen, categorie, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={categorie ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
    >
      <CategorieForm categorie={categorie} onClose={onClose} />
    </Modal>
  )
}