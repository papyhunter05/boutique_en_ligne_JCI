// Seuil à partir duquel le stock est considéré comme faible (inclus)
export const LOW_STOCK_THRESHOLD = 5

// Totaux du stock d'un produit à partir de ses variantes
export function summarizeStock(variantes) {
  return variantes.reduce(
    (sum, v) => ({
      total: sum.total + (Number(v.quantite_stock) || 0),
      reserve: sum.reserve + (Number(v.quantite_reservee) || 0),
      disponible: sum.disponible + (Number(v.stock_disponible) || 0),
      inactives: sum.inactives + (v.statut === 'ACTIF' ? 0 : 1),
    }),
    { total: 0, reserve: 0, disponible: 0, inactives: 0 },
  )
}

// État du stock : 0 → rupture, 1 à 5 → faible, au-dessus → en stock
export function getStockLevel(quantity) {
  if (quantity <= 0) return { key: 'rupture', label: 'Rupture', tone: 'danger' }
  if (quantity <= LOW_STOCK_THRESHOLD) return { key: 'faible', label: 'Stock faible', tone: 'warning' }
  return { key: 'ok', label: 'En stock', tone: 'success' }
}