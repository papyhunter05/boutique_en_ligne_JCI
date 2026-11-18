import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthModalContext } from './AuthModalContext'
import AuthModal from '../components/auth/AuthModal'
import { isStaffRole } from '../utils/roles'

export default function AuthModalProvider({ children }) {
  const navigate = useNavigate()
  const [state, setState] = useState({ isOpen: false, mode: 'login' })

  const openLogin = useCallback(() => setState({ isOpen: true, mode: 'login' }), [])
  const openRegister = useCallback(() => setState({ isOpen: true, mode: 'register' }), [])
  const close = useCallback(() => setState((current) => ({ ...current, isOpen: false })), [])
  const setMode = useCallback((mode) => setState({ isOpen: true, mode }), [])

  // Un administrateur est envoyé vers son espace, un client reste où il est
  const handleSuccess = useCallback(
    (utilisateur) => {
      close()
      if (isStaffRole(utilisateur.role)) navigate('/admin')
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