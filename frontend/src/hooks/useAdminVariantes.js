import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getVariantes,
  createVariante,
  updateVariante,
  toggleVarianteStatut,
} from '../api/adminVariantes.api'

export function useVariantes(idProduit) {
  return useQuery({
    queryKey: ['produits', 'variantes', String(idProduit)],
    queryFn: () => getVariantes(idProduit),
    enabled: Boolean(idProduit),
  })
}

function useRefreshAfterChange() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['produits'] }),
      queryClient.invalidateQueries({ queryKey: ['stock'] }),
    ])
}

export function useCreateVariante() {
  const refresh = useRefreshAfterChange()
  return useMutation({ mutationFn: createVariante, onSettled: refresh })
}

export function useUpdateVariante() {
  const refresh = useRefreshAfterChange()
  return useMutation({ mutationFn: updateVariante, onSettled: refresh })
}

export function useToggleVarianteStatut() {
  const refresh = useRefreshAfterChange()
  return useMutation({ mutationFn: toggleVarianteStatut, onSettled: refresh })
}