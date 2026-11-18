import { http } from './http'
import { toMouvement } from './adminCommandes.api'

// filters : { search, statut, zone, from, to } → paramètres du backend
export async function getLivraisons({ page = 1, filters = {} } = {}) {
  const params = { page }
  const mapping = {
    recherche: filters.search,
    statut: filters.statut,
    zone_livraison: filters.zone,
    date_debut: filters.from,
    date_fin: filters.to,
  }
  Object.entries(mapping).forEach(([key, value]) => {
    if (value) params[key] = value
  })

  const { data } = await http.get('/admin/livraisons', { params })
  const pagination = data.pagination ?? {}

  return {
    items: data.data ?? [],
    pagination: {
      currentPage: pagination.page_actuelle ?? page,
      lastPage: pagination.derniere_page ?? 1,
      total: pagination.total ?? 0,
      perPage: pagination.par_page ?? 15,
    },
  }
}

export async function getLivraison(idLivraison) {
  const { data } = await http.get(`/admin/livraisons/${idLivraison}`)
  const livraison = data.data
  return {
    ...livraison,
    mouvements: (livraison.commande?.mouvements_stock ?? []).map(toMouvement),
  }
}

export async function updateLivraisonStatut({ id, statut }) {
  const { data } = await http.patch(`/admin/livraisons/${id}/statut`, { statut })
  return data
}