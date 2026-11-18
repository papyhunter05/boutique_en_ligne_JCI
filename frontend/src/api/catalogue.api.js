import { http } from './http'

// Fiche d'un produit : exige d'être connecté. 404 si le produit n'est plus disponible.
export async function getProduitDetail(idProduit) {
  const { data } = await http.get(`/produits/${idProduit}`)
  return data.data
}