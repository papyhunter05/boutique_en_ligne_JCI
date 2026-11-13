import axios from 'axios'
import { tokenStorage } from './tokenStorage'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { Accept: 'application/json' }, // évite les redirections HTML de Laravel
  timeout: 15000,
})

// Le contexte React s'inscrit ici : http.js n'importe jamais React.
let handlers = {
  onUnauthorized: () => {},
  onForbidden: () => {},
}

export function setAuthHandlers(newHandlers) {
  handlers = { ...handlers, ...newHandlers }
}

// Ajoute le token à chaque requête
http.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Gère 401 et 403, sauf pour les requêtes qui le demandent (skipAuthHandling)
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if (!error.config?.skipAuthHandling) {
      if (status === 401) handlers.onUnauthorized(error)
      if (status === 403) handlers.onForbidden(error)
    }
    return Promise.reject(error)
  },
)