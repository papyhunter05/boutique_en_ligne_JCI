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