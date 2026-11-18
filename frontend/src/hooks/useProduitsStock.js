import { useQueries } from '@tanstack/react-query'
import { getVariantes } from '../api/adminVariantes.api'
import { summarizeStock } from '../utils/stock'

const STALE_MS = 60_000

// Un résultat par requête, dans le même ordre que les identifiants
function combineStocks(results) {
  return results.map((result) => {
    if (result.data) return { status: 'ready', ...summarizeStock(result.data.variantes) }
    if (result.isError) return { status: 'error' }
    return { status: 'loading' }
  })
}

// Stock de chaque produit, calculé à partir de ses variantes (une requête par produit).
// Même clé de cache que la fiche produit et la page des variantes.
export function useProduitsStock(produitIds) {
  return useQueries({
    queries: produitIds.map((id) => ({
      queryKey: ['produits', 'variantes', String(id)],
      queryFn: () => getVariantes(id),
      staleTime: STALE_MS,
    })),
    combine: combineStocks,
  })
}