import { useContext } from 'react'
import { AuthModalContext } from '../context/AuthModalContext'

export function useAuthModal() {
  const context = useContext(AuthModalContext)
  if (!context) {
    throw new Error('useAuthModal doit être utilisé dans un AuthModalProvider')
  }
  return context
}