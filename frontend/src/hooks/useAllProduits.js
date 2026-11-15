import { useQuery } from '@tanstack/react-query'
import { getAdminProduits } from '../api/adminProduits.api'

const MAX_PAGES = 100 // garde-fou contre une boucle infinie

export function useAllProduits({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['produits', 'admin', 'all'],
    enabled,
    queryFn: async () => {
      const all = []
      let page = 1
      let lastPage = 1

      do {
        const result = await getAdminProduits({ page })
        all.push(...result.items)
        lastPage = result.pagination.lastPage
        page += 1
      } while (page <= lastPage && page <= MAX_PAGES)

      return all.sort((a, b) => a.nom_produit.localeCompare(b.nom_produit, 'fr'))
    },
  })
}