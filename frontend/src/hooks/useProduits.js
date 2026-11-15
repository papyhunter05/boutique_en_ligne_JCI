import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getProduits } from '../api/produits.api'

export function useProduits(page = 1) {
  return useQuery({
    queryKey: ['produits', 'public', page],
    queryFn: () => getProduits({ page }),
    // Garde l'ancienne page affichée pendant le chargement de la suivante
    placeholderData: keepPreviousData,
  })
}