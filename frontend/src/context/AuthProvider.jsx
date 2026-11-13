import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'
import { useNotification } from '../hooks/useNotification'
import { tokenStorage } from '../api/tokenStorage'
import { setAuthHandlers } from '../api/http'
import * as authApi from '../api/auth.api'

export default function AuthProvider({ children }) {
  const notify = useNotification()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(tokenStorage.get()))

  useEffect(() => {
    if (!tokenStorage.get()) return

    let cancelled = false
    authApi
      .getMe()
      .then((utilisateur) => {
        if (!cancelled) setUser(utilisateur)
      })
      .catch((error) => {
        if (error.response?.status === 401) tokenStorage.clear()
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

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

  const login = useCallback(async (credentials) => {
    const { token, utilisateur } = await authApi.login(credentials)
    tokenStorage.set(token)
    setUser(utilisateur)
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
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'ADMIN',
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}