import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getMouvements,
  getMouvementsVariante,
  createEntree,
  createSortie,
} from '../api/adminStock.api'

export function useMouvements(page = 1) {
  return useQuery({
    queryKey: ['stock', 'global', page],
    queryFn: () => getMouvements({ page }),
    placeholderData: keepPreviousData,
  })
}

export function useMouvementsVariante(idVariante, page = 1) {
  return useQuery({
    queryKey: ['stock', 'variante', idVariante, page],
    queryFn: () => getMouvementsVariante({ idVariante, page }),
    // On ne garde l'ancienne page affichée que pour la MÊME variante
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[2] === idVariante ? previousData : undefined,
  })
}

// Rechargé même après une erreur (onSettled) : on affiche toujours l'état réel du stock.
function useRefreshAfterMovement() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['stock'] }),
      queryClient.invalidateQueries({ queryKey: ['produits'] }), // stock affiché par variante
    ])
}

// Pas de réessai automatique : un mouvement de stock n'est pas rejouable sans risque.
export function useCreateEntree() {
  const refresh = useRefreshAfterMovement()
  return useMutation({ mutationFn: createEntree, retry: false, onSettled: refresh })
}

export function useCreateSortie() {
  const refresh = useRefreshAfterMovement()
  return useMutation({ mutationFn: createSortie, retry: false, onSettled: refresh })
}