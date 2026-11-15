import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAdminCategories,
  createCategorie,
  updateCategorie,
  setCategorieStatut,
} from '../api/adminCategories.api'

export function useAdminCategories() {
  return useQuery({
    queryKey: ['categories', 'admin'],
    queryFn: getAdminCategories,
  })
}

// Après une modification, on rafraîchit les catégories ET les produits
// (le nombre de produits par catégorie et leur affichage peuvent changer).
function useRefreshAfterChange() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['categories'] }),
      queryClient.invalidateQueries({ queryKey: ['produits'] }),
    ])
}

export function useCreateCategorie() {
  const refresh = useRefreshAfterChange()
  return useMutation({ mutationFn: createCategorie, onSettled: refresh })
}

export function useUpdateCategorie() {
  const refresh = useRefreshAfterChange()
  return useMutation({ mutationFn: updateCategorie, onSettled: refresh })
}

export function useSetCategorieStatut() {
  const refresh = useRefreshAfterChange()
  return useMutation({ mutationFn: setCategorieStatut, onSettled: refresh })
}