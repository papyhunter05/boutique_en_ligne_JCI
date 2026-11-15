// Affiche la valeur telle que renvoyée par l'API.
// 25 → « 25 Ar » · "30000.00" → « 30.000 Ar » · "1250.5" → « 1.250,50 Ar »
export function formatPrix(value) {
  const number = Number(value)
  if (value === null || value === undefined || value === '' || Number.isNaN(number)) {
    return '—'
  }
  const [integer, decimals] = number.toFixed(2).split('.')
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return decimals === '00' ? `${grouped} Ar` : `${grouped},${decimals} Ar`
}

// Affiche la date au format « lundi 25 décembre 2023 » (ex. 25/12/2023)
export function formatDateLongue(date = new Date()) {
  const text = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Affiche la date au format « jj/mm/aaaa » (ex. 25/12/2023)
export function formatDate(value) {
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

// « 12/11/2026 14:30 » (heure locale)
export function formatDateTime(value) {
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// « Blanc · M » ou « Sans modèle »
export function formatVariante({ modele, taille }) {
  return [modele || 'Sans modèle', taille].filter(Boolean).join(' · ')
}