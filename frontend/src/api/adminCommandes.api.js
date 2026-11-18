import { http } from './http'

function pickDate(mouvement) {
  return mouvement.date_creation ?? mouvement.date_mouvement ?? mouvement.created_at ?? null
}

// Met un mouvement du détail au format attendu par MouvementsTable
export function toMouvement(m) {
  return {
    id_mouvement: m.id_mouvement,
    type_mouvement: m.type_mouvement,
    quantite: m.quantite,
    motif: m.motif,
    id_commande: m.id_commande,
    date: pickDate(m),
    produit: m.variante?.produit?.nom_produit ?? '—',
    variante: {
      id_variante: m.variante?.id_variante,
      modele: m.variante?.modele,
      taille: m.variante?.taille,
      sku: m.variante?.sku,
    },
    administrateur: m.utilisateur ? { nom: m.utilisateur.nom, prenom: m.utilisateur.prenom } : null,
  }
}

// filters : { search, statut, mode, from, to } → paramètres du backend
export async function getCommandes({ page = 1, filters = {} } = {}) {
  const params = { page }
  const mapping = {
    recherche: filters.search,
    statut: filters.statut,
    mode_reception: filters.mode,
    date_debut: filters.from,
    date_fin: filters.to,
  }
  Object.entries(mapping).forEach(([key, value]) => {
    if (value) params[key] = value
  })

  const { data } = await http.get('/admin/commandes', { params })
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

export async function getCommande(idCommande) {
  const { data } = await http.get(`/admin/commandes/${idCommande}`)
  const commande = data.data
  return {
    ...commande,
    mouvements: (commande.mouvements_stock ?? []).map(toMouvement),
  }
}