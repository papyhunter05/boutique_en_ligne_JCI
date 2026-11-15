import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'
import styles from './AdminLayout.module.css'
import RouteErrorBoundary from '../common/RouteErrorBoundary'

import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import '@fontsource/poppins/400-italic.css'
import '@fontsource/poppins/600-italic.css'


export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  // Échap ferme le tiroir (mobile)
  useEffect(() => {
    if (!menuOpen) return
    function onKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <div className={styles.layout}>
      <AdminSidebar isOpen={menuOpen} onNavigate={() => setMenuOpen(false)} />

      {menuOpen && (
        <div className={styles.backdrop} onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      <div className={styles.content}>
        <AdminTopbar menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} />
        <main className={styles.main}>
          <RouteErrorBoundary>
            <Outlet />
          </RouteErrorBoundary>
        </main>
      </div>
    </div>
  )
}