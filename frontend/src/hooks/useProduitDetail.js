import { useQuery } from '@tanstack/react-query'
import { getProduitDetail } from '../api/catalogue.api'

// Rechargé à chaque ouverture : le stock affiché doit rester à jour
export function useProduitDetail(idProduit) {
  return useQuery({
    queryKey: ['catalogue', 'produit', String(idProduit)],
    queryFn: () => getProduitDetail(idProduit),
    enabled: Boolean(idProduit),
  })
}