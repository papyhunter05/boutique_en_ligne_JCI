import { useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthModalContext } from './AuthModalContext'
import AuthModal from '../components/auth/AuthModal'
import { isStaffRole } from '../utils/roles'

export default function AuthModalProvider({ children }) {
  const navigate = useNavigate()
  const [state, setState] = useState({ isOpen: false, mode: 'login' })

  // Action à exécuter après une connexion réussie (ex. ouvrir le produit cliqué)
  const afterLogin = useRef(null)

  // openLogin() ou openLogin({ onSuccess }) ; reçoit aussi l'événement quand il sert d'onClick
  const openLogin = useCallback((options) => {
    afterLogin.current = typeof options?.onSuccess === 'function' ? options.onSuccess : null
    setState({ isOpen: true, mode: 'login' })
  }, [])

  const openRegister = useCallback(() => {
    afterLogin.current = null
    setState({ isOpen: true, mode: 'register' })
  }, [])

  const close = useCallback(() => setState((current) => ({ ...current, isOpen: false })), [])
  const setMode = useCallback((mode) => setState({ isOpen: true, mode }), [])

  // Un administrateur est envoyé vers son espace. Un client poursuit son action.
  const handleSuccess = useCallback(
    (utilisateur) => {
      close()
      const callback = afterLogin.current
      afterLogin.current = null

      if (isStaffRole(utilisateur.role)) {
        navigate('/admin')
        return
      }
      callback?.()
    },
    [close, navigate],
  )

  const value = useMemo(() => ({ openLogin, openRegister, close }), [openLogin, openRegister, close])

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthModal
        isOpen={state.isOpen}
        mode={state.mode}
        onModeChange={setMode}
        onClose={close}
        onSuccess={handleSuccess}
      />
    </AuthModalContext.Provider>
  )
}