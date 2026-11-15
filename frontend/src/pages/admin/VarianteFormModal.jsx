import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import ImageField from '../../components/ui/ImageField'
import { useCreateVariante, useUpdateVariante } from '../../hooks/useAdminVariantes'
import { useNotification } from '../../hooks/useNotification'
import { applyServerErrors } from '../../utils/errors'
import styles from './VarianteFormModal.module.css'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 2 * 1024 * 1024 // 2 Mo, comme « max:2048 » (Ko) côté Laravel

const baseShape = {
  modele: z.string().trim().max(100, '100 caractères maximum'),
  taille: z.string().trim().max(50, '50 caractères maximum'),
  sku: z.string().trim().min(1, 'Le SKU est obligatoire').max(100, '100 caractères maximum'),
}

const createSchema = z.object({
  ...baseShape,
  quantite_stock: z
    .string()
    .trim()
    .min(1, 'Le stock initial est obligatoire')
    .regex(/^\d+$/, 'Entrez un nombre entier positif ou nul'),
})

const editSchema = z.object(baseShape)

const FIELDS = ['modele', 'taille', 'sku', 'quantite_stock', 'image']

function VarianteForm({ produitId, variante, onClose }) {
  const isEdit = Boolean(variante)
  const notify = useNotification()
  const createMutation = useCreateVariante()
  const updateMutation = useUpdateVariante()
  const [file, setFile] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: isEdit
      ? { modele: variante.modele ?? '', taille: variante.taille ?? '', sku: variante.sku }
      : { modele: '', taille: '', sku: '', quantite_stock: '' },
  })

  function handleFileChange(selected) {
    if (!selected) return
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setError('image', { type: 'manual', message: 'Format accepté : JPEG, PNG ou WebP.' })
      return
    }
    if (selected.size > MAX_BYTES) {
      setError('image', { type: 'manual', message: "L'image ne doit pas dépasser 2 Mo." })
      return
    }
    clearErrors('image')
    setFile(selected)
  }

  async function submit(values) {
    if (!isEdit && !file) {
      setError('image', { type: 'manual', message: "L'image est obligatoire." })
      return
    }

    try {
      if (isEdit) {
        // Seuls les champs modifiés sont envoyés
        const changes = {}
        if (values.modele !== (variante.modele ?? '')) changes.modele = values.modele
        if (values.taille !== (variante.taille ?? '')) changes.taille = values.taille
        if (values.sku !== variante.sku) changes.sku = values.sku

        if (Object.keys(changes).length === 0 && !file) {
          notify.info('Aucune modification à enregistrer.')
          onClose()
          return
        }

        await updateMutation.mutateAsync({
          idProduit: produitId,
          idVariante: variante.id_variante,
          changes,
          image: file,
        })
        notify.success('Variante modifiée.')
      } else {
        await createMutation.mutateAsync({
          idProduit: produitId,
          values: {
            modele: values.modele,
            taille: values.taille,
            sku: values.sku,
            quantite_stock: Number(values.quantite_stock),
          },
          image: file,
        })
        notify.success('Variante ajoutée.')
      }
      onClose()
    } catch (error) {
      applyServerErrors(error, setError, FIELDS)
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className={styles.form}>
      <div className={styles.row}>
        <Input
          label="Modèle (facultatif)"
          placeholder="Ex. Blanc, Bleu nuit"
          error={errors.modele?.message}
          {...register('modele')}
        />
        <Input
          label="Taille (facultative)"
          placeholder="Ex. M, 42"
          error={errors.taille?.message}
          {...register('taille')}
        />
      </div>

      <Input label="SKU" error={errors.sku?.message} {...register('sku')} />

      {isEdit ? (
        <p className={styles.note}>
          Stock actuel : <strong>{variante.quantite_stock}</strong> (réservé :{' '}
          {variante.quantite_reservee}). Le stock ne se modifie pas ici : il se gère par
          mouvements de stock.
        </p>
      ) : (
        <Input
          label="Stock initial"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          hint="Enregistré comme première entrée dans l'historique du stock."
          error={errors.quantite_stock?.message}
          {...register('quantite_stock')}
        />
      )}

      <ImageField
        label={isEdit ? 'Image (laisser vide pour garder l’actuelle)' : 'Image'}
        currentUrl={isEdit ? variante.image : null}
        file={file}
        onFileChange={handleFileChange}
        error={errors.image?.message}
        hint="JPEG, PNG ou WebP, 2 Mo maximum."
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

// variante = null → création, sinon modification
export default function VarianteFormModal({ isOpen, produitId, variante, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={variante ? 'Modifier la variante' : 'Ajouter une variante'}
    >
      <VarianteForm produitId={produitId} variante={variante} onClose={onClose} />
    </Modal>
  )
}