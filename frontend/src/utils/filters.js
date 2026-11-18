// Sans accents ni majuscules : « Vêtements » correspond à « vetements »
export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

// Tous les mots saisis doivent apparaître quelque part dans les champs
export function matchesSearch(query, fields) {
  const q = normalizeText(query)
  if (!q) return true
  const haystack = normalizeText(fields.filter(Boolean).join(' '))
  return q.split(/\s+/).every((word) => haystack.includes(word))
}

// from et to : « 2026-11-17 » (valeur d'un champ date). Comparaison en heure locale.
// Un élément sans date est exclu dès qu'une période est choisie.
export function isWithinDates(value, from, to) {
  if (!from && !to) return true
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime())) return false
  if (from && date < new Date(`${from}T00:00:00`)) return false
  if (to && date > new Date(`${to}T23:59:59.999`)) return false
  return true
}

