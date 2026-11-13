const TOKEN_KEY = 'jci_token'

// Seul fichier qui sait où le token est stocké.
// Pour garder la session entre onglets : remplacer sessionStorage par localStorage.
export const tokenStorage = {
  get() {
    try {
      return sessionStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token) {
    try {
      sessionStorage.setItem(TOKEN_KEY, token)
    } catch {
      /* stockage indisponible : la session ne survivra pas au rechargement */
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(TOKEN_KEY)
    } catch {
      /* rien à faire */
    }
  },
}