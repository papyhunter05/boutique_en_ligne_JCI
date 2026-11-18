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

const MAX_PAGES = 20 // 300 mouvements au maximum (15 par page)

// Supprime les doublons si un nouveau mouvement a décalé les pages pendant le chargement
function uniqueById(items) {
  return [...new Map(items.map((item) => [item.id_mouvement, item])).values()]
}

// Historique global complet, pour pouvoir le filtrer
export function useAllMouvements() {
  return useQuery({
    queryKey: ['stock', 'global', 'all'],
    queryFn: async () => {
      const items = []
      let page = 1
      let lastPage = 1
      let total = 0

      do {
        const result = await getMouvements({ page })
        items.push(...result.items)
        lastPage = result.pagination.lastPage
        total = result.pagination.total
        page += 1
      } while (page <= lastPage && page <= MAX_PAGES)

      return { items: uniqueById(items), total, truncated: lastPage > MAX_PAGES }
    },
  })
}

// Historique complet d'une variante
export function useAllMouvementsVariante(idVariante) {
  return useQuery({
    queryKey: ['stock', 'variante', idVariante, 'all'],
    queryFn: async () => {
      const first = await getMouvementsVariante({ idVariante, page: 1 })
      const items = [...first.items]
      const { lastPage, total } = first.pagination

      for (let page = 2; page <= lastPage && page <= MAX_PAGES; page += 1) {
        const result = await getMouvementsVariante({ idVariante, page })
        items.push(...result.items)
      }

      return {
        produit: first.produit,
        variante: first.variante,
        items: uniqueById(items),
        total,
        truncated: lastPage > MAX_PAGES,
      }
    },
  })
}