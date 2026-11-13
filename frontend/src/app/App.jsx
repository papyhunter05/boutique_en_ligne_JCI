import { Routes, Route } from 'react-router-dom'
import PublicLayout from '../components/layout/PublicLayout'
import RequireAdmin from '../components/common/RequireAdmin'
import HomePage from '../pages/public/HomePage'
import AdminHomePage from '../pages/admin/AdminHomePage'
import NotFoundPage from '../pages/NotFoundPage'
import DevAuthTestPage from '../pages/DevAuthTestPage'
import DevUiPage from '../pages/DevUiPage'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
      </Route>

      <Route path="/admin" element={<RequireAdmin />}>
        <Route index element={<AdminHomePage />} />
      </Route>

      {/* Pages de test : à supprimer avant la mise en production */}
      <Route path="/dev/auth" element={<DevAuthTestPage />} />
      <Route path="/dev/ui" element={<DevUiPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}