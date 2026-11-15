import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'
import { useNotification } from '../hooks/useNotification'
import { tokenStorage } from '../api/tokenStorage'
import { setAuthHandlers } from '../api/http'
import * as authApi from '../api/auth.api'

// Restaure la session à partir du token enregistré.
// 401 ou 403 : le token ne vaut plus rien, on l'efface.
// Autre erreur (réseau, serveur) : on garde le token et on signale l'échec.
async function fetchSession() {
  try {
    return { user: await authApi.getMe() }
  } catch (error) {
    const status = error.response?.status
    if (status === 401 || status === 403) {
      tokenStorage.clear()
      return { user: null }
    }
    return { failed: true }
  }
}

export default function AuthProvider({ children }) {
  const notify = useNotification()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(tokenStorage.get()))
  const [sessionError, setSessionError] = useState(false)

  // Restaure la session au démarrage
  useEffect(() => {
    if (!tokenStorage.get()) return

    let cancelled = false
    fetchSession().then((result) => {
      if (cancelled) return
      if (result.user) setUser(result.user)
      if (result.failed) setSessionError(true)
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  // Réactions globales aux erreurs 401 et 403 d'Axios
  useEffect(() => {
    setAuthHandlers({
      onUnauthorized: () => {
        tokenStorage.clear()
        setUser(null)
        notify.error('Votre session a expiré. Veuillez vous reconnecter.')
      },
      onForbidden: (error) => {
        notify.error(error.response?.data?.message || 'Accès refusé.')
      },
    })
  }, [notify])

  const retrySession = useCallback(async () => {
    setSessionError(false)
    setIsLoading(true)
    const result = await fetchSession()
    if (result.user) setUser(result.user)
    if (result.failed) setSessionError(true)
    setIsLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    const { token, utilisateur } = await authApi.login(credentials)
    tokenStorage.set(token)
    setUser(utilisateur)
    setSessionError(false)
    return utilisateur
  }, [])

  // Si l'API renvoie un token à l'inscription, on l'utilise.
  // Sinon on enchaîne avec une connexion classique.
  const register = useCallback(
    async (payload) => {
      const data = await authApi.register(payload)
      if (data?.token && data?.utilisateur) {
        tokenStorage.set(data.token)
        setUser(data.utilisateur)
        setSessionError(false)
        return data.utilisateur
      }
      return login({ email: payload.email, mot_de_passe: payload.mot_de_passe })
    },
    [login],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      /* même si le serveur échoue, on déconnecte côté navigateur */
    }
    tokenStorage.clear()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      sessionError,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'ADMIN',
      login,
      register,
      logout,
      retrySession,
    }),
    [user, isLoading, sessionError, login, register, logout, retrySession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}