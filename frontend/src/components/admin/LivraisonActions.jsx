import { useState } from 'react'
import Button from '../ui/Button'
import ConfirmDialog from '../common/ConfirmDialog'
import { useUpdateLivraisonStatut } from '../../hooks/useAdminLivraisons'
import { useNotification } from '../../hooks/useNotification'
import { getErrorMessage, isUncertainError } from '../../utils/errors'
import {
  COMMANDE_STATUT_LABELS,
  LIVRAISON_STATUT_LABELS,
  labelOf,
} from '../../utils/commandeFields'
import {
  ACTION_LABELS,
  SYNCED_TO_COMMANDE,
  getDeliveryActions,
} from '../../utils/livraisonTransitions'
import styles from './LivraisonActions.module.css'

function describe(statut, reference) {
  const livraison = labelOf(LIVRAISON_STATUT_LABELS, statut)

  if (statut === 'ECHEC') {
    return `La livraison de la commande ${reference} sera marquée comme « ${livraison} ». Cette action est définitive : aucune autre étape ne sera possible.`
  }

  const sync = SYNCED_TO_COMMANDE.includes(statut)
    ? ` Le statut de la commande passera aussi à « ${labelOf(COMMANDE_STATUT_LABELS, statut)} ».`
    : ''
  return `La livraison de la commande ${reference} passera à « ${livraison} ».${sync} Cette étape ne pourra pas être annulée.`
}

// Seules les actions cohérentes avec le statut actuel sont proposées.
export default function LivraisonActions({
  livraison,
  commandeStatut,
  commandeReference,
  size = 'sm',
  allowFailure = false, // « Déclarer un échec » : seulement sur les pages de livraison
  showHint = false,     // explication affichée quand l'action est bloquée
}) {
  const notify = useNotification()
  const mutation = useUpdateLivraisonStatut()
  // Le statut visé est conservé après la fermeture : le texte ne change pas pendant l'animation
  const [dialog, setDialog] = useState({ open: false, statut: null })

  const { next, canFail, blockedReason } = getDeliveryActions(livraison, commandeStatut)
  const showFailure = allowFailure && canFail
  if (!next && !showFailure) return null

  const ask = (statut) => setDialog({ open: true, statut })
  const close = () => setDialog((state) => ({ ...state, open: false }))

  async function confirm() {
    const statut = dialog.statut
    try {
      const result = await mutation.mutateAsync({ id: livraison.id_livraison, statut })
      const applied = result?.data?.nouveau_statut ?? statut
      notify.success(
        `Commande ${commandeReference} : livraison « ${labelOf(LIVRAISON_STATUT_LABELS, applied)} ».`,
      )
    } catch (error) {
      if (isUncertainError(error)) {
        notify.error(
          "Le résultat est incertain : la connexion a été interrompue. L'état a été rechargé, vérifiez-le avant de recommencer.",
        )
      } else {
        // Message du backend (transition refusée, paiement non confirmé…)
        notify.error(getErrorMessage(error))
      }
    }
    close()
  }

  return (
    <>
      <span className={styles.group}>
        {next && (
          <Button
            size={size}
            variant="accent"
            onClick={() => ask(next)}
            disabled={Boolean(blockedReason) || mutation.isPending}
            title={blockedReason ?? undefined}
          >
            {ACTION_LABELS[next]}
          </Button>
        )}
        {showFailure && (
          <Button size={size} variant="soft" onClick={() => ask('ECHEC')} disabled={mutation.isPending}>
            {ACTION_LABELS.ECHEC}
          </Button>
        )}
        {showHint && blockedReason && <span className={styles.hint}>{blockedReason}</span>}
      </span>

      <ConfirmDialog
        isOpen={dialog.open}
        onClose={close}
        onConfirm={confirm}
        loading={mutation.isPending}
        title={dialog.statut ? ACTION_LABELS[dialog.statut] : ''}
        message={dialog.statut ? describe(dialog.statut, commandeReference) : ''}
        confirmLabel="Confirmer"
        confirmVariant={dialog.statut === 'ECHEC' ? 'danger' : 'accent'}
      />
    </>
  )
}