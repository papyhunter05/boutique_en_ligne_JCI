import { http } from './http'

export async function getVariantes(idProduit) {
  const { data } = await http.get(`/admin/produits/${idProduit}/variantes`)
  return {
    produit: data.data.produit,
    variantes: (data.data.variantes ?? []).map((variante) => ({
      ...variante,
      image: variante.image_url ?? null,
    })),
  }
}

// values : champs texte et nombres. image : le fichier (File)
export async function createVariante({ idProduit, values, image }) {
  const form = new FormData()
  Object.entries(values).forEach(([key, value]) => form.append(key, value))
  form.append('image', image)

  // Axios ajoute lui-même l'en-tête multipart avec la bonne « boundary »
  const { data } = await http.post(`/admin/produits/${idProduit}/variantes`, form)
  return data
}

// changes : uniquement les champs modifiés. image : nouveau fichier, ou null
export async function updateVariante({ idProduit, idVariante, changes, image }) {
  const url = `/admin/produits/${idProduit}/variantes/${idVariante}`

  if (image) {
    // Laravel ne lit pas un fichier envoyé en PUT : POST + _method=PUT
    const form = new FormData()
    Object.entries(changes).forEach(([key, value]) => form.append(key, value))
    form.append('image', image)
    form.append('_method', 'PUT')
    const { data } = await http.post(url, form)
    return data
  }

  const { data } = await http.put(url, changes)
  return data
}

// Le serveur bascule ACTIF ↔ INACTIF : aucun corps à envoyer
export async function toggleVarianteStatut({ idProduit, idVariante }) {
  const { data } = await http.patch(`/admin/produits/${idProduit}/variantes/${idVariante}/statut`)
  return data
}