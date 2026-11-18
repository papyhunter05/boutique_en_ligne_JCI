const BASE = (import.meta.env.VITE_STORAGE_URL || '/storage').replace(/\/$/, '')

// Les images du panier arrivent en chemin relatif (« variantes/xxx.webp »)
export function storageUrl(path) {
  if (!path) return null
  if (/^https?:\/\//.test(path)) return path
  return `${BASE}/${path.replace(/^\/+/, '')}`
}