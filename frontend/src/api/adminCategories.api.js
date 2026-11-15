import { http } from './http'

export async function getAdminCategories() {
  const { data } = await http.get('/admin/categories')
  return data.data ?? []
}

export async function createCategorie(payload) {
  const { data } = await http.post('/admin/categories', payload)
  return data
}

export async function updateCategorie({ id, ...payload }) {
  const { data } = await http.put(`/admin/categories/${id}`, payload)
  return data
}

// Si ton backend attend un autre corps, c'est la seule ligne à modifier
export async function setCategorieStatut({ id, statut }) {
  const { data } = await http.patch(`/admin/categories/${id}/statut`, { statut })
  return data
}