import { useCallback } from 'react'
import { useAuth } from './useAuth'
import { useAuthModal } from './useAuthModal'
import { useProductModal } from './useProductModal'

export function useProductSelect() {
  const { isAuthenticated } = useAuth()
  const { openLogin } = useAuthModal()
  const { openProduct } = useProductModal()

  return useCallback(
    (idProduit) => {
      if (isAuthenticated) openProduct(idProduit)
      else openLogin({ onSuccess: () => openProduct(idProduit) })
    },
    [isAuthenticated, openLogin, openProduct],
  )
}