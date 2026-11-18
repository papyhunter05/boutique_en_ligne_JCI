import { KNOWN_LIVRAISON_STATUTS } from './commandeFields'

// Miroir de AdminLivraisonController@updateStatut. Il sert uniquement à n'afficher que les
// actions possibles : le backend reste l'autorité et refuse toute autre transition (422).
const START = {
  EN_ATTENTE: ['EN_PREPARATION', 'ECHEC'],
  EN_PREPARATION: ['EXPEDIEE', 'ECHEC'],
}

const TRANSITIONS = {
  ANTANANARIVO: { ...START, EXPEDIEE: ['LIVREE', 'ECHEC'] },
  PROVINCE: {
    ...START,
    EXPEDIEE: ['ARRIVEE_AGENCE', 'ECHEC'],
    ARRIVEE_AGENCE: ['LIVREE', 'ECHEC'],
  },
}

// ANNULEE est refusé par le filtre du backend
export const FILTERABLE_STATUTS = KNOWN_LIVRAISON_STATUTS.filter((s) => s !== 'ANNULEE')

// Statuts que le backend recopie sur la commande
export const SYNCED_TO_COMMANDE = ['EN_PREPARATION', 'EXPEDIEE', 'LIVREE']

export const ACTION_LABELS = {
  EN_PREPARATION: 'Préparer la commande',
  EXPEDIEE: 'Expédier la commande',
  ARRIVEE_AGENCE: "Arrivée à l'agence",
  LIVREE: 'Livrer la commande',
  ECHEC: 'Déclarer un échec',
}

// Actions possibles pour une livraison, selon sa zone, son statut et celui de sa commande
export function getDeliveryActions(livraison, commandeStatut) {
  const none = { next: null, canFail: false, blockedReason: null }
  if (!livraison || commandeStatut === 'ANNULEE') return none

  const allowed = TRANSITIONS[livraison.zone_livraison]?.[livraison.statut] ?? []
  const next = allowed.find((statut) => statut !== 'ECHEC') ?? null
  const canFail = allowed.includes('ECHEC')
  const blocked = next === 'EN_PREPARATION' && commandeStatut !== 'CONFIRMEE'

  return {
    next,
    canFail,
    blockedReason: blocked ? 'Le paiement de la commande doit d\u2019abord être confirmé.' : null,
  }
}