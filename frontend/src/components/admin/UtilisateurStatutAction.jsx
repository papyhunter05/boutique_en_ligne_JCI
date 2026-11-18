import { useState } from 'react'
import Button from '../ui/Button'
import ConfirmDialog from '../common/ConfirmDialog'
import { useAuth } from '../../hooks/useAuth'
import { useToggleUtilisateurStatut } from '../../hooks/useAdminUtilisateurs'
import { useNotification } from '../../hooks/useNotification'
import { getErrorMessage, isUncertainError } from '../../utils/errors'
import { ROLE_LABELS } from '../../utils/roles'

// Bloque ou débloque un compte, toujours après confirmation.
export default function UtilisateurStatutAction({ utilisateur, size = 'sm', variant = 'soft' }) {
  const { user } = useAuth()
  const notify = useNotification()
  const mutation = useToggleUtilisateurStatut()

  // Le statut au moment du clic est conservé : le texte ne change pas
  // pendant l'animation de fermeture, même si la liste se recharge.
  const [dialog, setDialog] = useState({ open: false, statut: null })
  const close = () => setDialog((state) => ({ ...state, open: false }))

  // Jamais de blocage de son propre compte ni du SUPER_ADMIN
  if (utilisateur.id_utilisateur === user?.id_utilisateur || utilisateur.role === 'SUPER_ADMIN') {
    return null
  }

  const name = `${utilisateur.prenom} ${utilisateur.nom}`
  const isBlocking = dialog.statut === 'ACTIF'

  async function confirm() {
    try {
      const result = await mutation.mutateAsync(utilisateur.id_utilisateur)
      // Le serveur bascule le statut : le message suit sa réponse, pas notre hypothèse
      const statut = result?.data?.statut
      if (statut === 'BLOQUE') notify.success(`Compte de ${name} bloqué.`)
      else if (statut === 'ACTIF') notify.success(`Compte de ${name} débloqué.`)
      else notify.success(`Statut du compte de ${name} modifié.`)
    } catch (error) {
      if (isUncertainError(error)) {
        notify.error(
          "Le résultat est incertain : la connexion a été interrompue. L'état a été rechargé, vérifiez-le avant de recommencer.",
        )
      } else {
        notify.error(getErrorMessage(error))
      }
    }
    close()
  }

  const blockMessage =
    `Le compte de ${name} (${ROLE_LABELS[utilisateur.role] ?? utilisateur.role}) sera bloqué : ` +
    'cette personne sera déconnectée et ne pourra plus se connecter.' +
    (utilisateur.role === 'ADMIN' ? " Elle perdra l'accès à l'espace d'administration." : '') +
    ' Vous pourrez la débloquer à tout moment.'

  return (
    <>
      <Button
        size={size}
        variant={variant}
        onClick={() => setDialog({ open: true, statut: utilisateur.statut })}
        disabled={mutation.isPending}
      >
        {utilisateur.statut === 'ACTIF' ? 'Bloquer' : 'Débloquer'}
      </Button>

      <ConfirmDialog
        isOpen={dialog.open}
        onClose={close}
        onConfirm={confirm}
        loading={mutation.isPending}
        title={isBlocking ? 'Bloquer ce compte ?' : 'Débloquer ce compte ?'}
        message={
          isBlocking
            ? blockMessage
            : `Le compte de ${name} sera débloqué : cette personne pourra de nouveau se connecter.`
        }
        confirmLabel={isBlocking ? 'Bloquer' : 'Débloquer'}
        confirmVariant={isBlocking ? 'danger' : 'accent'}
      />
    </>
  )
}