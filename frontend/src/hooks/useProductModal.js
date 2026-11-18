import { useContext } from 'react'
import { ProductModalContext } from '../context/ProductModalContext'

export function useProductModal() {
  const context = useContext(ProductModalContext)
  if (!context) {
    throw new Error('useProductModal doit être utilisé dans un ProductModalProvider')
  }
  return context
}