import { useQuery } from '@tanstack/react-query'
import { getAdminProduits } from '../api/adminProduits.api'

const MAX_PAGES = 100 // garde-fou contre une boucle infinie

export function useActiveProduitsCount() {
  return useQuery({
    // Sous la clé « produits » : toute modification de produit invalidera ce compteur aussi
    queryKey: ['produits', 'admin', 'active-count'],
    queryFn: async () => {
      let page = 1
      let lastPage = 1
      let count = 0

      do {
        const result = await getAdminProduits({ page })
        count += result.items.filter((produit) => produit.statut === 'ACTIF').length
        lastPage = result.pagination.lastPage
        page += 1
      } while (page <= lastPage && page <= MAX_PAGES)

      return count
    },
  })
}