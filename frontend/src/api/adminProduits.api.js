import { http } from './http'

export async function getAdminProduits({ page = 1 } = {}) {
  const { data } = await http.get('/admin/produits', { params: { page } })
  const paginator = data.data

  return {
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

export async function createProduit(payload) {
  const { data } = await http.post('/admin/produits', payload)
  return data
}

export async function updateProduit({ id, ...payload }) {
  const { data } = await http.put(`/admin/produits/${id}`, payload)
  return data
}

// Le serveur bascule ACTIF ↔ INACTIF : aucun corps à envoyer
export async function toggleProduitStatut(id) {
  const { data } = await http.patch(`/admin/produits/${id}/statut`)
  return data
}