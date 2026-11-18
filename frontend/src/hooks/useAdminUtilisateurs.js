import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getUtilisateurs,
  getUtilisateur,
  toggleUtilisateurStatut,
  createAdmin,
} from '../api/adminUtilisateurs.api'

export function useUtilisateurs(page, filters) {
  return useQuery({
    queryKey: ['utilisateurs', 'list', page, filters],
    queryFn: () => getUtilisateurs({ page, filters }),
    placeholderData: keepPreviousData,
  })
}

export function useUtilisateur(idUtilisateur) {
  return useQuery({
    queryKey: ['utilisateurs', 'detail', idUtilisateur],
    queryFn: () => getUtilisateur(idUtilisateur),
    enabled: Boolean(idUtilisateur),
  })
}

// Rechargé même après une erreur réseau : on affiche toujours l'état réel du compte
function useRefreshAfterChange() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['utilisateurs'] })
}

// Pas de réessai automatique : la bascule ACTIF ↔ BLOQUE n'est pas rejouable sans risque.
export function useToggleUtilisateurStatut() {
  const refresh = useRefreshAfterChange()
  return useMutation({ mutationFn: toggleUtilisateurStatut, retry: false, onSettled: refresh })
}

export function useCreateAdmin() {
  const refresh = useRefreshAfterChange()
  return useMutation({ mutationFn: createAdmin, retry: false, onSettled: refresh })
}