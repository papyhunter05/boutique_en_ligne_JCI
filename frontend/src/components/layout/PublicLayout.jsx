import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import styles from './PublicLayout.module.css'
import RouteErrorBoundary from '../common/RouteErrorBoundary'

export default function PublicLayout() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <RouteErrorBoundary>
          <Outlet />
        </RouteErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}