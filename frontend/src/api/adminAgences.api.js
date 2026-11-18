import { http } from './http'

// L'identifiant est ramené à `id`, quel que soit le nom de la clé côté Laravel
function normalize(agence) {
  return { ...agence, id: agence.id_agence ?? agence.id }
}

export async function getAgences() {
  const { data } = await http.get('/admin/agences-transport')
  return (data.data ?? []).map(normalize)
}

export async function createAgence(payload) {
  const { data } = await http.post('/admin/agences-transport', payload)
  return data
}

// changes : uniquement les champs modifiés (le backend refuse une requête vide)
export async function updateAgence({ id, ...changes }) {
  const { data } = await http.put(`/admin/agences-transport/${id}`, changes)
  return data
}

// Le serveur bascule ACTIVE ↔ INACTIVE : aucun corps à envoyer
export async function toggleAgenceStatut(id) {
  const { data } = await http.patch(`/admin/agences-transport/${id}/statut`)
  return data
}