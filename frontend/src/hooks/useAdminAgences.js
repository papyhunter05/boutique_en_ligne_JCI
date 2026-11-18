import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAgences,
  createAgence,
  updateAgence,
  toggleAgenceStatut,
} from '../api/adminAgences.api'

export function useAdminAgences() {
  return useQuery({
    queryKey: ['agences', 'admin'],
    queryFn: getAgences,
  })
}

// Rechargé même après une erreur réseau : on affiche toujours l'état réel
function useRefreshAfterChange() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['agences'] })
}

export function useCreateAgence() {
  const refresh = useRefreshAfterChange()
  return useMutation({ mutationFn: createAgence, onSettled: refresh })
}

export function useUpdateAgence() {
  const refresh = useRefreshAfterChange()
  return useMutation({ mutationFn: updateAgence, onSettled: refresh })
}

export function useToggleAgenceStatut() {
  const refresh = useRefreshAfterChange()
  return useMutation({ mutationFn: toggleAgenceStatut, onSettled: refresh })
}