import { http } from './http'

export async function getProduits({ page = 1 } = {}) {
  const { data } = await http.get('/produits', { params: { page } })
  const paginator = data.data

  return {
    // `image` : l'URL complète de l'image, ou null s'il n'y en a pas
    items: (paginator.data ?? []).map((produit) => ({
      ...produit,
      image: produit.image_url ?? null,
    })),
    pagination: {
      currentPage: paginator.current_page,
      lastPage: paginator.last_page,
      total: paginator.total,
      perPage: paginator.per_page,
    },
  }
}