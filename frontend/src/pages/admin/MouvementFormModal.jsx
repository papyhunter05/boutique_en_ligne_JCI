import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import StateMessage from '../../components/common/StateMessage'
import { useAllProduits } from '../../hooks/useAllProduits'
import { useVariantes } from '../../hooks/useAdminVariantes'
import { useCreateEntree, useCreateSortie } from '../../hooks/useAdminStock'
import { useNotification } from '../../hooks/useNotification'
import { applyServerErrors, isUncertainError } from '../../utils/errors'
import { formatVariante } from '../../utils/format'
import styles from './MouvementFormModal.module.css'

const TEXTS = {
  entree: {
    title: 'Réapprovisionner',
    operation: 'Entrée (réapprovisionnement)',
    confirm: "Confirmer l'entrée",
    sign: '+',
    motifPlaceholder: 'Ex. Réception fournisseur',
    motifSuggestions: [
      'Réapprovisionnement fournisseur',
      'Nouvel achat de marchandises',
      'Retour client',
    ],
    success: 'Réapprovisionnement enregistré.',
    confirmVariant: 'accent',
  },
  sortie: {
    title: 'Sortie manuelle',
    operation: 'Sortie manuelle',
    confirm: 'Confirmer la sortie',
    sign: '−',
    motifPlaceholder: 'Ex. Article endommagé',
    motifSuggestions: [
      'Produit endommagé',
      'Produit défectueux',
      'Perte de marchandises',
      'Vol de marchandises',
    ],
    success: 'Sortie de stock enregistrée.',
    confirmVariant: 'danger',
  },
}

const quantiteRule = z
  .string()
  .trim()
  .min(1, 'La quantité est obligatoire')
  .regex(/^[1-9]\d*$/, 'Entrez un nombre entier supérieur à 0')

const motifRule = z
  .string()
  .trim()
  .min(1, 'Le motif est obligatoire')
  .max(255, '255 caractères maximum')

function buildSchema(isFixed) {
  if (isFixed) {
    return z.object({ id_variante: z.string(), quantite: quantiteRule, motif: motifRule })
  }
  return z.object({
    id_produit: z.string().min(1, 'Choisissez un produit'),
    id_variante: z.string().min(1, 'Choisissez une variante'),
    quantite: quantiteRule,
    motif: motifRule,
  })
}

function MouvementForm({ mode, fixedVariante, produits, onClose }) {
  const isFixed = Boolean(fixedVariante)
  const motifListId = useId()
  const texts = TEXTS[mode]
  const notify = useNotification()
  const entreeMutation = useCreateEntree()
  const sortieMutation = useCreateSortie()
  const mutation = mode === 'entree' ? entreeMutation : sortieMutation

  // Valeurs validées, en attente de confirmation
  const [recap, setRecap] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(buildSchema(isFixed)),
    defaultValues: {
      id_produit: '',
      id_variante: isFixed ? String(fixedVariante.id_variante) : '',
      quantite: '',
      motif: '',
    },
  })

  const idProduit = watch('id_produit')
  const idVariante = watch('id_variante')

  // Variantes du produit choisi : seules les variantes actives sont acceptées par le serveur
  const variantesQuery = useVariantes(isFixed ? '' : idProduit)
  const variantes = (variantesQuery.data?.variantes ?? []).filter((v) => v.statut === 'ACTIF')

  const selected = isFixed
    ? fixedVariante
    : variantes.find((v) => String(v.id_variante) === idVariante)

  const target = selected && {
    produit: isFixed
      ? fixedVariante.produit
      : produits.find((p) => String(p.id_produit) === idProduit)?.nom_produit,
    label: formatVariante(selected),
    sku: selected.sku,
    disponible: selected.stock_disponible,
  }

  const produitOptions = produits.map((p) => ({
    value: String(p.id_produit),
    label: p.statut === 'ACTIF' ? p.nom_produit : `${p.nom_produit} (inactif)`,
  }))

  const varianteOptions = variantes.map((v) => ({
    value: String(v.id_variante),
    label: `${formatVariante(v)} — ${v.sku} (disponible : ${v.stock_disponible})`,
  }))

  const knownFields = isFixed ? ['quantite', 'motif'] : ['id_variante', 'quantite', 'motif']

  // Étape 1 : le formulaire est valide, on demande confirmation
  function onValid(values) {
    // Confort : évite une requête inutile. Le serveur reste l'autorité.
    if (mode === 'sortie' && target && Number(values.quantite) > target.disponible) {
      setError('quantite', {
        type: 'manual',
        message: `La quantité dépasse le stock disponible (${target.disponible}).`,
      })
      return
    }
    setRecap(values)
  }

  // Étape 2 : envoi réel après confirmation
  async function confirm() {
    try {
      await mutation.mutateAsync({
        id_variante: Number(recap.id_variante),
        quantite: Number(recap.quantite),
        motif: recap.motif,
      })
      notify.success(texts.success)
      onClose()
    } catch (error) {
      setRecap(null) // retour au formulaire pour afficher l'erreur

      if (isUncertainError(error)) {
        setError('root', {
          type: 'server',
          message:
            "Le résultat est incertain : la connexion a été interrompue. Consultez l'historique avant de recommencer, pour ne pas enregistrer l'opération deux fois.",
        })
        return
      }
      applyServerErrors(error, setError, knownFields)
    }
  }

  return (
    <>
      {/* « hidden » plutôt que démonté : le formulaire garde ses valeurs pendant la confirmation */}
      <form
        hidden={Boolean(recap)}
        onSubmit={handleSubmit(onValid)}
        noValidate
        className={styles.form}
      >
        {isFixed ? (
          <div className={styles.target}>
            <strong>{fixedVariante.produit}</strong>
            <span>
              {formatVariante(fixedVariante)} · SKU {fixedVariante.sku}
            </span>
          </div>
        ) : (
          <>
            <Select
              label="Produit"
              placeholder="Choisir un produit"
              options={produitOptions}
              error={errors.id_produit?.message}
              data-autofocus
              {...register('id_produit', {
                // Changer de produit réinitialise la variante choisie
                onChange: () => setValue('id_variante', ''),
              })}
            />
            <Select
              label="Variante"
              placeholder={
                !idProduit
                  ? "Choisissez d'abord un produit"
                  : variantesQuery.isPending
                    ? 'Chargement…'
                    : 'Choisir une variante'
              }
              options={varianteOptions}
              hint={
                idProduit && variantesQuery.isSuccess && variantes.length === 0
                  ? "Ce produit n'a aucune variante active."
                  : undefined
              }
              error={
                variantesQuery.isError
                  ? 'Impossible de charger les variantes.'
                  : errors.id_variante?.message
              }
              {...register('id_variante')}
            />
          </>
        )}

        {target && (
          <p className={styles.stockInfo}>
            Stock disponible actuel : <strong>{target.disponible}</strong>
          </p>
        )}

        <Input
          label="Quantité"
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          error={errors.quantite?.message}
          {...(isFixed ? { 'data-autofocus': true } : {})}
          {...register('quantite')}
        />
        <Input
          label="Motif"
          placeholder={texts.motifPlaceholder}
          list={motifListId}
          error={errors.motif?.message}
          {...register('motif')}
        />
        <datalist id={motifListId}>
          {texts.motifSuggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>

        {errors.root && (
          <p role="alert" className={styles.formError}>
            {errors.root.message}
          </p>
        )}

        <div className={styles.actions}>
          <Button variant="soft" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="accent">
            Continuer
          </Button>
        </div>
      </form>

      {recap && (
        <div className={styles.recap}>
          <p className={styles.recapTitle}>Vérifiez avant de confirmer</p>

          <dl className={styles.summary}>
            <dt>Opération</dt>
            <dd>{texts.operation}</dd>
            <dt>Produit</dt>
            <dd>{target?.produit ?? '—'}</dd>
            <dt>Variante</dt>
            <dd>
              {target ? `${target.label} · SKU ${target.sku}` : '—'}
            </dd>
            <dt>Quantité</dt>
            <dd>
              {texts.sign}
              {recap.quantite}
            </dd>
            <dt>Motif</dt>
            <dd>{recap.motif}</dd>
          </dl>

          <p className={styles.warning}>
            Cette opération sera inscrite dans l'historique et ne peut pas être annulée.
          </p>

          <div className={styles.actions}>
            <Button variant="soft" onClick={() => setRecap(null)} disabled={mutation.isPending}>
              Retour
            </Button>
            <Button
              variant={texts.confirmVariant}
              onClick={confirm}
              loading={mutation.isPending}
            >
              {texts.confirm}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

// Charge la liste des produits avant d'afficher le formulaire (sauf si la variante est imposée)
function MouvementFormLoader({ mode, fixedVariante, onClose }) {
  const { data: produits, isPending, isError, refetch } = useAllProduits({
    enabled: !fixedVariante,
  })

  if (fixedVariante) {
    return (
      <MouvementForm mode={mode} fixedVariante={fixedVariante} produits={[]} onClose={onClose} />
    )
  }

  if (isPending) return <p className={styles.info}>Chargement des produits…</p>

  if (isError) {
    return (
      <StateMessage
        isError
        title="Impossible de charger les produits."
        actionLabel="Réessayer"
        onAction={() => refetch()}
      />
    )
  }

  if (produits.length === 0) {
    return (
      <StateMessage
        title="Aucun produit."
        message="Créez d'abord un produit et une variante."
      />
    )
  }

  return <MouvementForm mode={mode} fixedVariante={null} produits={produits} onClose={onClose} />
}

// fixedVariante : { id_variante, produit, modele, taille, sku, stock_disponible } ou null
export default function MouvementFormModal({ isOpen, mode, fixedVariante = null, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title={TEXTS[mode].title}>
      <MouvementFormLoader mode={mode} fixedVariante={fixedVariante} onClose={onClose} />
    </Modal>
  )
}