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
import RequireSuperAdmin from '../components/common/RequireSuperAdmin'
import UtilisateursPage from '../pages/admin/UtilisateursPage'
import AgencesPage from '../pages/admin/AgencesPage'
import CommandesPage from '../pages/admin/CommandesPage'
import CommandeDetailPage from '../pages/admin/CommandeDetailPage'
import LivraisonsPage from '../pages/admin/LivraisonsPage'
import LivraisonDetailPage from '../pages/admin/LivraisonDetailPage'
import UtilisateurDetailPage from '../pages/admin/UtilisateurDetailPage'
import RequireClient from '../components/common/RequireClient'
import CartPage from '../pages/public/CartPage'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route element={<RequireClient />}>
          <Route path="panier" element={<CartPage />} />
        </Route>
      </Route>

      <Route path="/admin" element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminHomePage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="produits" element={<ProduitsPage />} />
          <Route path="produits/:id/variantes" element={<VariantesPage />} />
          <Route path="stock" element={<StockPage />} />
          <Route path="stock/variantes/:idVariante" element={<VarianteStockPage />} />
          <Route path="agences" element={<AgencesPage />} />
          <Route path="commandes" element={<CommandesPage />} />
          <Route path="commandes/:id" element={<CommandeDetailPage />} />
          <Route path="livraisons" element={<LivraisonsPage />} />
          <Route path="livraisons/:id" element={<LivraisonDetailPage />} />
          <Route element={<RequireSuperAdmin />}>
            <Route path="utilisateurs" element={<UtilisateursPage />} />
            <Route path="utilisateurs/:id" element={<UtilisateurDetailPage />} />
          </Route>
        </Route>
      </Route>

      {/* Pages de test : à supprimer avant la mise en production */}
      {/* <Route path="/dev/auth" element={<DevAuthTestPage />} />
      <Route path="/dev/ui" element={<DevUiPage />} /> */}

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}