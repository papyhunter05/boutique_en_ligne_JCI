import { NavLink } from 'react-router-dom'
import Logo from '../common/Logo'
import { ADMIN_NAV } from '../../app/adminNav'
import { useAuth } from '../../hooks/useAuth'
import styles from './AdminSidebar.module.css'

export default function AdminSidebar({ isOpen, onNavigate }) {
  const { isSuperAdmin } = useAuth()

  // Un ADMIN ne voit pas les entrées réservées au SUPER_ADMIN
  const items = ADMIN_NAV.filter((item) => !item.superAdminOnly || isSuperAdmin)

  return (
    <aside
      id="admin-sidebar"
      className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}
      aria-label="Menu d'administration"
    >
      <div className={styles.brand}>
        <Logo subtitle="Espace administrateur" />
      </div>

      <nav>
        <ul className={styles.list}>
          {items.map(({ path, label, icon: Icon, enabled, end }) => (
            <li key={path}>
              {enabled ? (
                <NavLink
                  to={path}
                  end={end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `${styles.link} ${isActive ? styles.active : ''}`
                  }
                >
                  <Icon size={20} stroke={1.6} aria-hidden="true" />
                  {label}
                </NavLink>
              ) : (
                <span className={`${styles.link} ${styles.disabled}`} aria-disabled="true">
                  <Icon size={20} stroke={1.6} aria-hidden="true" />
                  {label}
                  <span className={styles.soon}>Bientôt</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}