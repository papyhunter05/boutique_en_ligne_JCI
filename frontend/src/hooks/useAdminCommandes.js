import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getCommandes, getCommande } from '../api/adminCommandes.api'

export function useCommandes(page, filters) {
  return useQuery({
    queryKey: ['commandes', 'admin', 'list', page, filters],
    queryFn: () => getCommandes({ page, filters }),
    // Garde l'ancienne liste affichée pendant le chargement de la suivante
    placeholderData: keepPreviousData,
  })
}

export function useCommande(idCommande) {
  return useQuery({
    queryKey: ['commandes', 'admin', 'detail', idCommande],
    queryFn: () => getCommande(idCommande),
    enabled: Boolean(idCommande),
  })
}