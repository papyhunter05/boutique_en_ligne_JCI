import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import StateMessage from '../../components/common/StateMessage'
import { useAdminCategories } from '../../hooks/useAdminCategories'
import { useCreateProduit, useUpdateProduit } from '../../hooks/useAdminProduits'
import { useNotification } from '../../hooks/useNotification'
import { applyServerErrors } from '../../utils/errors'
import styles from './ProduitFormModal.module.css'

const schema = z.object({
  id_categorie: z.string().min(1, 'Choisissez une catégorie'),
  nom_produit: z
    .string()
    .trim()
    .min(1, 'Le nom est obligatoire')
    .max(150, '150 caractères maximum'),
  description: z.string().trim(),
  prix: z
    .string()
    .trim()
    .min(1, 'Le prix est obligatoire')
    .refine(
      (value) => !Number.isNaN(Number(value)) && Number(value) >= 0,
      'Le prix doit être un nombre positif ou nul',
    ),
})

const FIELDS = ['id_categorie', 'nom_produit', 'description', 'prix']

// Champs réellement modifiés par rapport au produit d'origine
function getChanges(produit, payload) {
  const changes = {}
  if (Number(produit.id_categorie) !== payload.id_categorie) changes.id_categorie = payload.id_categorie
  if (produit.nom_produit !== payload.nom_produit) changes.nom_produit = payload.nom_produit
  if ((produit.description ?? '') !== payload.description) changes.description = payload.description
  if (Number(produit.prix) !== payload.prix) changes.prix = payload.prix
  return changes
}

function ProduitForm({ produit, categories, onClose }) {
  const isEdit = Boolean(produit)
  const notify = useNotification()
  const createMutation = useCreateProduit()
  const updateMutation = useUpdateProduit()

  // Le backend n'accepte que des catégories actives. En modification, on garde
  // la catégorie actuelle dans la liste même si elle a été désactivée depuis.
  const options = categories
    .filter(
      (c) => c.statut === 'ACTIF' || (isEdit && c.id_categorie === produit.id_categorie),
    )
    .map((c) => ({
      value: String(c.id_categorie),
      label: c.statut === 'ACTIF' ? c.nom_categorie : `${c.nom_categorie} (inactive)`,
    }))

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      id_categorie: produit ? String(produit.id_categorie) : '',
      nom_produit: produit?.nom_produit ?? '',
      description: produit?.description ?? '',
      prix: produit ? String(Number(produit.prix)) : '',
    },
  })

  async function submit(values) {
    const payload = {
      id_categorie: Number(values.id_categorie),
      nom_produit: values.nom_produit,
      description: values.description,
      prix: Number(values.prix),
    }

    try {
      if (isEdit) {
        const changes = getChanges(produit, payload)
        if (Object.keys(changes).length === 0) {
          notify.info('Aucune modification à enregistrer.')
          onClose()
          return
        }
        await updateMutation.mutateAsync({ id: produit.id_produit, ...changes })
        notify.success('Produit modifié.')
      } else {
        await createMutation.mutateAsync(payload)
        notify.success('Produit ajouté. Pensez à lui ajouter des variantes.')
      }
      onClose()
    } catch (error) {
      applyServerErrors(error, setError, FIELDS)
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className={styles.form}>
      <Select
        label="Catégorie"
        placeholder="Choisir une catégorie"
        options={options}
        error={errors.id_categorie?.message}
        {...register('id_categorie')}
      />
      <Input
        label="Nom du produit"
        error={errors.nom_produit?.message}
        {...register('nom_produit')}
      />
      <Textarea
        label="Description (facultative)"
        error={errors.description?.message}
        {...register('description')}
      />
      <Input
        label="Prix (Ar)"
        type="number"
        min="0"
        step="any"
        inputMode="decimal"
        error={errors.prix?.message}
        {...register('prix')}
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

// Charge les catégories avant d'afficher le formulaire
function ProduitFormLoader({ produit, onClose }) {
  const { data: categories, isPending, isError, refetch } = useAdminCategories()

  if (isPending) return <p className={styles.info}>Chargement des catégories…</p>

  if (isError) {
    return (
      <StateMessage
        isError
        title="Impossible de charger les catégories."
        actionLabel="Réessayer"
        onAction={() => refetch()}
      />
    )
  }

  if (!categories.some((c) => c.statut === 'ACTIF')) {
    return (
      <StateMessage
        title="Aucune catégorie active."
        message="Un produit doit appartenir à une catégorie active. Créez ou activez une catégorie d'abord."
      />
    )
  }

  return <ProduitForm produit={produit} categories={categories} onClose={onClose} />
}

// produit = null → création, sinon modification
export default function ProduitFormModal({ isOpen, produit, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={produit ? 'Modifier le produit' : 'Ajouter un produit'}
    >
      <ProduitFormLoader produit={produit} onClose={onClose} />
    </Modal>
  )
}