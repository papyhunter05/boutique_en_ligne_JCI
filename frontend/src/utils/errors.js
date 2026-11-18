// Message affichable à l'utilisateur à partir d'une erreur Axios
const UNREACHABLE_STATUSES = [502, 503, 504]

export function getErrorMessage(error, fallback = 'Une erreur est survenue. Réessayez plus tard.') {
  if (error?.code === 'ECONNABORTED') {
    return 'Le serveur met trop de temps à répondre. Réessayez.'
  }
  // Pas de réponse du tout, ou serveur injoignable derrière un proxy
  if (!error?.response || UNREACHABLE_STATUSES.includes(error.response.status)) {
    return 'Impossible de joindre le serveur. Vérifiez votre connexion.'
  }
  // Pas de message brut pour les erreurs serveur : il pourrait contenir des détails techniques
  if (error.response.status >= 500) {
    return fallback
  }
  return error.response.data?.message || fallback
}

// Erreurs 422 de Laravel : { champ: "premier message" }
export function getFieldErrors(error) {
  if (error?.response?.status !== 422) return {}
  const errors = error.response.data?.errors ?? {}
  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [field, messages[0]]),
  )
}

// Applique une erreur Laravel à un formulaire React Hook Form.
// knownFields : les champs réellement présents dans le formulaire.
export function applyServerErrors(error, setError, knownFields) {
  const fieldErrors = getFieldErrors(error)
  const unknownMessages = []
  let handled = false

  Object.entries(fieldErrors).forEach(([field, message]) => {
    if (knownFields.includes(field)) {
      setError(field, { type: 'server', message })
      handled = true
    } else {
      unknownMessages.push(message)
    }
  })

  if (!handled) {
    setError('root', {
      type: 'server',
      message: unknownMessages[0] ?? getErrorMessage(error),
    })
  }
}

// L'issue est incertaine : le serveur a peut-être traité la demande
// malgré l'erreur (pas de réponse, ou erreur serveur).
export function isUncertainError(error) {
  if (!error?.response) return true
  return error.response.status >= 500
}

// Premier message de validation (422) renvoyé par Laravel, sinon un message générique
export function getFirstError(error, fallback) {
  const first = Object.values(getFieldErrors(error))[0]
  return first ?? getErrorMessage(error, fallback)
}