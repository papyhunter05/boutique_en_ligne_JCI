const modeleKey = (variante) => variante.modele ?? ''

// Première variante en stock (du modèle donné, ou de toutes), sinon la première
export function pickDefaultVariante(variantes, modele) {
  const pool = modele === undefined ? variantes : variantes.filter((v) => modeleKey(v) === modele)
  return pool.find((v) => v.stock_disponible > 0) ?? pool[0] ?? null
}

// Le choix du modèle n'est proposé que s'il y en a plusieurs
export function getModeleOptions(variantes) {
  const keys = [...new Set(variantes.map(modeleKey))]
  if (keys.length < 2) return []
  return keys.map((key) => {
    const soldOut = variantes.filter((v) => modeleKey(v) === key).every((v) => v.stock_disponible <= 0)
    return { value: key, label: `${key || 'Standard'}${soldOut ? ' (épuisé)' : ''}` }
  })
}

// Le choix de la taille n'est proposé que si le modèle en possède
export function getTailleOptions(variantes, modele) {
  const pool = variantes.filter((v) => modeleKey(v) === modele)
  if (!pool.some((v) => v.taille)) return []
  return pool.map((v) => ({
    value: String(v.id_variante),
    label: `${v.taille ?? 'Unique'}${v.stock_disponible <= 0 ? ' (épuisé)' : ''}`,
  }))
}

export { modeleKey }