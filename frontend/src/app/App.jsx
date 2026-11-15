import { Routes, Route } from 'react-router-dom'
import PublicLayout from '../components/layout/PublicLayout'
import AdminLayout from '../components/layout/AdminLayout'
import RequireAdmin from '../components/common/RequireAdmin'
import HomePage from '../pages/public/HomePage'
import AdminHomePage from '../pages/admin/AdminHomePage'
import NotFoundPage from '../pages/NotFoundPage'
// import DevAuthTestPage from '../pages/DevAuthTestPage'
// import DevUiPage from '../pages/DevUiPage'
import CategoriesPage from '../pages/admin/CategoriesPage'
import ProduitsPage from '../pages/admin/ProduitsPage'
import VariantesPage from '../pages/admin/VariantesPage'
import StockPage from '../pages/admin/StockPage'
import VarianteStockPage from '../pages/admin/VarianteStockPage'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
      </Route>

      <Route path="/admin" element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminHomePage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="produits" element={<ProduitsPage />} />
          <Route path="produits/:id/variantes" element={<VariantesPage />} />
          <Route path="stock" element={<StockPage />} />
          <Route path="stock/variantes/:idVariante" element={<VarianteStockPage />} />
        </Route>
      </Route>

      {/* Pages de test : à supprimer avant la mise en production */}
      {/* <Route path="/dev/auth" element={<DevAuthTestPage />} />
      <Route path="/dev/ui" element={<DevUiPage />} /> */}

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}