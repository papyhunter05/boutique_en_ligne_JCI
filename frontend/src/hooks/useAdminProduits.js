import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAdminProduits,
  createProduit,
  updateProduit,
  toggleProduitStatut,
} from '../api/adminProduits.api'

export function useAdminProduits(page = 1) {
  return useQuery({
    queryKey: ['produits', 'admin', 'list', page],
    queryFn: () => getAdminProduits({ page }),
    // Garde l'ancienne page affichée pendant le chargement de la suivante
    placeholderData: keepPreviousData,
  })
}

// Rafraîchit la liste admin, le compteur du tableau de bord, la boutique publique
// (tout ce qui est sous « produits ») et le nombre de produits par catégorie.
function useRefreshAfterChange() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['produits'],
        // Le stock vient des variantes : un changement de produit ne le modifie pas
        predicate: (query) => query.queryKey[1] !== 'variantes',
      }),
      queryClient.invalidateQueries({ queryKey: ['categories'] }),
    ])
}

export function useCreateProduit() {
  const refresh = useRefreshAfterChange()
  return useMutation({ mutationFn: createProduit, onSettled: refresh })
}

export function useUpdateProduit() {
  const refresh = useRefreshAfterChange()
  return useMutation({ mutationFn: updateProduit, onSettled: refresh })
}

export function useToggleProduitStatut() {
  const refresh = useRefreshAfterChange()
  return useMutation({ mutationFn: toggleProduitStatut, onSettled: refresh })
}