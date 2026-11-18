import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import {
  getPanier,
  addToPanier,
  updatePanierArticle,
  removePanierArticle,
  clearPanier,
} from '../api/panier.api'

// Le panier n'existe que pour un client connecté
export function usePanier() {
  const { isClient } = useAuth()
  return useQuery({
    queryKey: ['panier'],
    queryFn: getPanier,
    enabled: isClient,
  })
}

// Rechargé même après une erreur réseau : on affiche toujours l'état réel du panier.
function useRefreshAfterChange() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['panier'] })
}

// Pas de réessai automatique : l'ajout additionne la quantité, il n'est pas rejouable sans risque.
export function useAddToPanier() {
  const refresh = useRefreshAfterChange()
  return useMutation({ mutationFn: addToPanier, retry: false, onSettled: refresh })
}

export function useUpdatePanierArticle() {
  const refresh = useRefreshAfterChange()
  return useMutation({ mutationFn: updatePanierArticle, retry: false, onSettled: refresh })
}

export function useRemovePanierArticle() {
  const refresh = useRefreshAfterChange()
  return useMutation({ mutationFn: removePanierArticle, retry: false, onSettled: refresh })
}

export function useClearPanier() {
  const refresh = useRefreshAfterChange()
  return useMutation({ mutationFn: clearPanier, retry: false, onSettled: refresh })
}