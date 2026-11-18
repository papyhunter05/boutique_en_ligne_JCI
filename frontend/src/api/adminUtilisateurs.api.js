import { http } from './http'

// filters : { search, statut, role } → paramètres du backend
export async function getUtilisateurs({ page = 1, filters = {} } = {}) {
  const params = { page }
  const mapping = {
    recherche: filters.search,
    statut: filters.statut,
    role: filters.role,
  }
  Object.entries(mapping).forEach(([key, value]) => {
    if (value) params[key] = value
  })

  const { data } = await http.get('/admin/utilisateurs', { params })
  const paginator = data.data

  return {
    items: paginator.data ?? [],
    pagination: {
      currentPage: paginator.current_page,
      lastPage: paginator.last_page,
      total: paginator.total,
      perPage: paginator.per_page,
    },
  }
}

export async function getUtilisateur(idUtilisateur) {
  const { data } = await http.get(`/admin/utilisateurs/${idUtilisateur}`)
  return data.data
}

// Le serveur bascule ACTIF ↔ BLOQUE : aucun corps à envoyer
export async function toggleUtilisateurStatut(idUtilisateur) {
  const { data } = await http.patch(`/admin/utilisateurs/${idUtilisateur}/statut`)
  return data
}

// Le rôle est imposé par le serveur (ADMIN) : il n'est jamais envoyé
export async function createAdmin(payload) {
  const { data } = await http.post('/admin/utilisateurs/admin', payload)
  return data
}