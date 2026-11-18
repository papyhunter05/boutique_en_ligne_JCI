import { http } from './http'
import { storageUrl } from '../utils/storage'

export async function getPanier() {
  const { data } = await http.get('/panier')
  const panier = data.data
  return {
    ...panier,
    articles: (panier.articles ?? []).map((article) => ({
      ...article,
      image_url: storageUrl(article.image),
    })),
  }
}

// Le serveur AJOUTE la quantité à la ligne existante
export async function addToPanier({ id_variante, quantite }) {
  const { data } = await http.post('/panier/articles', { id_variante, quantite })
  return data
}

// Quantité absolue, minimum 1
export async function updatePanierArticle({ id, quantite }) {
  const { data } = await http.put(`/panier/articles/${id}`, { quantite })
  return data
}

export async function removePanierArticle(id) {
  const { data } = await http.delete(`/panier/articles/${id}`)
  return data
}

export async function clearPanier() {
  const { data } = await http.delete('/panier')
  return data
}