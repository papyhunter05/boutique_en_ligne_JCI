import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getLivraisons, getLivraison, updateLivraisonStatut } from '../api/adminLivraisons.api'

export function useLivraisons(page, filters) {
  return useQuery({
    queryKey: ['livraisons', 'admin', 'list', page, filters],
    queryFn: () => getLivraisons({ page, filters }),
    placeholderData: keepPreviousData,
  })
}

export function useLivraison(idLivraison) {
  return useQuery({
    queryKey: ['livraisons', 'admin', 'detail', idLivraison],
    queryFn: () => getLivraison(idLivraison),
    enabled: Boolean(idLivraison),
  })
}

// Une livraison change aussi le statut de sa commande : on recharge les deux,
// même après une erreur réseau, pour afficher l'état réel.
export function useUpdateLivraisonStatut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateLivraisonStatut,
    retry: false,
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['livraisons'] }),
        queryClient.invalidateQueries({ queryKey: ['commandes'] }),
      ]),
  })
}