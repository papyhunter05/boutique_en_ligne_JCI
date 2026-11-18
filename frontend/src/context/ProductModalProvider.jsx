import { useCallback, useMemo, useState } from 'react'
import { ProductModalContext } from './ProductModalContext'
import ProductDetailModal from '../components/shop/ProductDetailModal'

export default function ProductModalProvider({ children }) {
  // L'identifiant est conservé après la fermeture : le contenu ne change pas pendant l'animation de sortie
  const [state, setState] = useState({ open: false, productId: null })

  const openProduct = useCallback((productId) => setState({ open: true, productId }), [])
  const close = useCallback(() => setState((current) => ({ ...current, open: false })), [])
  const value = useMemo(() => ({ openProduct, close }), [openProduct, close])

  return (
    <ProductModalContext.Provider value={value}>
      {children}
      <ProductDetailModal isOpen={state.open} productId={state.productId} onClose={close} />
    </ProductModalContext.Provider>
  )
}