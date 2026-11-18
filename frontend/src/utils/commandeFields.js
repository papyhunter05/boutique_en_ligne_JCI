// ---------------------------------------------------------------------------
// Valeurs réelles de la table `commande`
// ---------------------------------------------------------------------------
export const COMMANDE_STATUT_LABELS = {
  EN_ATTENTE_PAIEMENT: 'En attente de paiement',
  CONFIRMEE: 'Confirmée',
  EN_PREPARATION: 'En préparation',
  EXPEDIEE: 'Expédiée',
  LIVREE: 'Livrée',
  ANNULEE: 'Annulée',
}

// success | warning | info | neutral | danger
export const COMMANDE_STATUT_TONES = {
  EN_ATTENTE_PAIEMENT: 'neutral',
  CONFIRMEE: 'warning', // « à traiter » sur la maquette
  EN_PREPARATION: 'info',
  EXPEDIEE: 'success',
  LIVREE: 'success',
  ANNULEE: 'danger',
}

// L'ordre de ces listes est celui des filtres (déroulement d'une commande)
export const KNOWN_COMMANDE_STATUTS = Object.keys(COMMANDE_STATUT_LABELS)

export const MODE_LABELS = {
  LIVRAISON_ANTANANARIVO: 'Livraison à Antananarivo',
  AGENCE_PROVINCE: 'Livraison en province (agence)',
  RETRAIT_MAGASIN: 'Retrait au magasin',
}
export const KNOWN_MODES = Object.keys(MODE_LABELS)

// ---------------------------------------------------------------------------
// Valeurs réelles de la table `livraison`
// ---------------------------------------------------------------------------
export const ZONE_LABELS = {
  ANTANANARIVO: 'Antananarivo',
  PROVINCE: 'Province',
}
export const KNOWN_ZONES = Object.keys(ZONE_LABELS)

export const LIVRAISON_STATUT_LABELS = {
  EN_ATTENTE: 'En attente',
  EN_PREPARATION: 'En préparation',
  EXPEDIEE: 'Expédiée',
  ARRIVEE_AGENCE: "Arrivée à l'agence",
  LIVREE: 'Livrée',
  ECHEC: 'Échec',
  ANNULEE: 'Annulée',
}

export const LIVRAISON_STATUT_TONES = {
  EN_ATTENTE: 'neutral',
  EN_PREPARATION: 'info',
  EXPEDIEE: 'success',
  ARRIVEE_AGENCE: 'warning',
  LIVREE: 'success',
  ECHEC: 'danger',
  ANNULEE: 'danger',
}

export const KNOWN_LIVRAISON_STATUTS = Object.keys(LIVRAISON_STATUT_LABELS)

// ---------------------------------------------------------------------------
// Champs d'un article de commande : noms SUPPOSÉS (table `commande_article` non vue).
// À corriger quand tu m'enverras son DESCRIBE.
// ---------------------------------------------------------------------------
const PRIX_UNITAIRE_KEYS = ['prix_unitaire', 'prix']
const SOUS_TOTAL_KEYS = ['sous_total', 'total_ligne', 'montant_ligne']

function pickFirst(object, keys) {
  for (const key of keys) {
    if (object?.[key] !== undefined && object[key] !== null) return object[key]
  }
  return null
}

export const getQuantite = (article) => pickFirst(article, ['quantite'])
export const getPrixUnitaire = (article) => pickFirst(article, PRIX_UNITAIRE_KEYS)
export const getSousTotal = (article) => pickFirst(article, SOUS_TOTAL_KEYS)

// ---------------------------------------------------------------------------
// Affichage
// ---------------------------------------------------------------------------

// « EN_ATTENTE_PAIEMENT » → « En attente paiement » (valeur inconnue)
export function prettify(value) {
  if (value === null || value === undefined || value === '') return '—'
  const text = String(value).replace(/_/g, ' ').toLowerCase().trim()
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function labelOf(labels, value) {
  return labels[value] ?? prettify(value)
}

// Options de filtre, dans l'ordre fourni
export function toOptions(values, labels) {
  return [...new Set(values.filter(Boolean))].map((value) => ({
    value,
    label: labelOf(labels, value),
  }))
}