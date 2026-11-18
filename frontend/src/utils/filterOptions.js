export const STATUT_OPTIONS = [
  { value: 'ACTIF', label: 'Actif' },
  { value: 'INACTIF', label: 'Inactif' },
]

export const VARIANTES_OPTIONS = [
  { value: 'avec', label: 'Avec variantes' },
  { value: 'sans', label: 'Sans variante' },
]

export const STOCK_OPTIONS = [
  { value: 'disponible', label: 'En stock' },
  { value: 'epuise', label: 'Épuisé' },
]

const MOUVEMENT_LABELS = { ENTREE: 'Entrée', SORTIE: 'Sortie' }

// Types réellement présents dans les données (les futurs types apparaîtront seuls)
export function buildTypeOptions(items) {
  return [...new Set(items.map((item) => item.type_mouvement))]
    .filter(Boolean)
    .map((value) => ({ value, label: MOUVEMENT_LABELS[value] ?? value }))
}

export const AGENCE_STATUT_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
]

export const USER_STATUT_OPTIONS = [
  { value: 'ACTIF', label: 'Actif' },
  { value: 'BLOQUE', label: 'Bloqué' },
]

export const USER_ROLE_OPTIONS = [
  { value: 'CLIENT', label: 'Client' },
  { value: 'ADMIN', label: 'Administrateur' },
]