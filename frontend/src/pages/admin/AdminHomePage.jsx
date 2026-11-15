import Button from '../../components/ui/Button'
import StatCard from '../../components/admin/StatCard'
import { IconCategory, IconPlus } from '../../components/ui/tablerIcons'
import { useAuth } from '../../hooks/useAuth'
import { useActiveProduitsCount } from '../../hooks/useActiveProduitsCount'
import { formatDateLongue } from '../../utils/format'
import styles from './AdminHomePage.module.css'
import { Link } from 'react-router-dom'

export default function AdminHomePage() {
  const { user } = useAuth()
  const { data: activeCount, isPending, isError } = useActiveProduitsCount()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.date}>{formatDateLongue()}</p>
          <h1 className={styles.title}>Bonjour, {user.prenom}</h1>
          <p className={styles.subtitle}>
            Voici ce qui se passe dans votre boutique aujourd'hui.
          </p>
        </div>

        {/* Sera relié à la page Produits au module suivant */}
        <Button
          as={Link}
          to="/admin/produits"
          state={{ openCreate: true }}
          variant="dark"
          leftIcon={<IconPlus size={18} />}
        >
          Ajouter un produit
        </Button>
      </header>

      <section className={styles.stats} aria-label="Statistiques">
        <StatCard
          label="Produits actifs"
          value={activeCount}
          hint="Produits au statut actif"
          icon={IconCategory}
          iconColor="var(--color-purple-73)"
          isLoading={isPending}
          isError={isError}
        />
      </section>
    </div>
  )
}