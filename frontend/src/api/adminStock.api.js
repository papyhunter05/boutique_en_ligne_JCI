import { http } from './http'

function toPagination(paginator) {
  return {
    currentPage: paginator.current_page,
    lastPage: paginator.last_page,
    total: paginator.total,
    perPage: paginator.per_page,
  }
}

// Nom du champ date selon ce que renvoie le backend
function pickDate(mouvement) {
  return mouvement.date_creation ?? mouvement.date_mouvement ?? mouvement.created_at ?? null
}

// Historique global
export async function getMouvements({ page = 1 } = {}) {
  const { data } = await http.get('/admin/mouvements-stock', { params: { page } })
  const paginator = data.data

  return {
    items: (paginator.data ?? []).map((m) => ({
      id_mouvement: m.id_mouvement,
      type_mouvement: m.type_mouvement,
      quantite: m.quantite,
      motif: m.motif,
      id_commande: m.id_commande,
      date: pickDate(m),
      produit: m.produit,
      variante: m.variante,
      administrateur: m.administrateur ?? null,
    })),
    pagination: toPagination(paginator),
  }
}

// Historique d'une variante (format de réponse différent : on le ramène au même)
export async function getMouvementsVariante({ idVariante, page = 1 }) {
  const { data } = await http.get(`/admin/variantes/${idVariante}/mouvements-stock`, {
    params: { page },
  })
  const paginator = data.mouvements

  return {
    produit: data.produit,
    variante: data.variante,
    items: (paginator.data ?? []).map((m) => ({
      id_mouvement: m.id_mouvement,
      type_mouvement: m.type_mouvement,
      quantite: m.quantite,
      motif: m.motif,
      id_commande: m.id_commande,
      date: pickDate(m),
      administrateur: m.utilisateur
        ? { nom: m.utilisateur.nom, prenom: m.utilisateur.prenom }
        : null,
    })),
    pagination: toPagination(paginator),
  }
}

export async function createEntree(payload) {
  const { data } = await http.post('/admin/mouvements-stock', payload)
  return data
}

export async function createSortie(payload) {
  const { data } = await http.post('/admin/mouvements-stock/sortie', payload)
  return data
}