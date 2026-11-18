import { Link, useNavigate, useParams } from 'react-router-dom'
import DataTable from '../../components/admin/DataTable'
import InfoList from '../../components/admin/InfoList'
import StatutBadge from '../../components/admin/StatutBadge'
import ValueBadge from '../../components/admin/ValueBadge'
import UtilisateurStatutAction from '../../components/admin/UtilisateurStatutAction'
import StateMessage from '../../components/common/StateMessage'
import { useUtilisateur } from '../../hooks/useAdminUtilisateurs'
import {
  COMMANDE_STATUT_LABELS,
  COMMANDE_STATUT_TONES,
  MODE_LABELS,
  labelOf,
} from '../../utils/commandeFields'
import { ROLE_LABELS, ROLE_TONES } from '../../utils/roles'
import { formatDateTime, formatPrix, pluralize } from '../../utils/format'
import styles from './CommandeDetailPage.module.css'
import listStyles from './CommandesPage.module.css'

const EMPTY = []

export default function UtilisateurDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: utilisateur, isPending, isError, error, refetch } = useUtilisateur(id)

  const backLink = (
    <Link to="/admin/utilisateurs" className={styles.back}>
      ← Retour aux utilisateurs
    </Link>
  )

  if (isPending) {
    return (
      <div className={styles.page}>
        <section className={styles.card}>
          {backLink}
          <span
            className={styles.skeleton}
            aria-busy="true"
            aria-label="Chargement de l'utilisateur"
          />
        </section>
      </div>
    )
  }

  if (isError) {
    const notFound = error?.response?.status === 404
    return (
      <div className={styles.page}>
        <section className={styles.card}>
          {backLink}
          <StateMessage
            isError
            title={notFound ? 'Utilisateur introuvable.' : "Impossible de charger l'utilisateur."}
            message={
              notFound
                ? "Ce compte n'existe pas ou n'est pas consultable."
                : 'Vérifiez votre connexion puis réessayez.'
            }
            actionLabel={notFound ? 'Retour aux utilisateurs' : 'Réessayer'}
            onAction={notFound ? () => navigate('/admin/utilisateurs') : () => refetch()}
          />
        </section>
      </div>
    )
  }

  const commandes = utilisateur.commandes ?? EMPTY

  const columns = [
    {
      key: 'reference',
      header: 'Commande',
      mobile: 'title',
      render: (c) => (
        <Link to={`/admin/commandes/${c.id_commande}`} className={listStyles.reference}>
          {c.reference}
        </Link>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (c) =>
        c.date_commande ? (
          <time dateTime={c.date_commande} className={listStyles.nowrap}>
            {formatDateTime(c.date_commande)}
          </time>
        ) : (
          '—'
        ),
    },
    { key: 'mode', header: 'Réception', render: (c) => labelOf(MODE_LABELS, c.mode_reception) },
    {
      key: 'statut',
      header: 'Statut',
      render: (c) => (
        <ValueBadge
          value={c.statut}
          labels={COMMANDE_STATUT_LABELS}
          tones={COMMANDE_STATUT_TONES}
        />
      ),
    },
    { key: 'total', header: 'Total', render: (c) => formatPrix(c.montant_total) },
  ]

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        {backLink}

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>
              {utilisateur.prenom} {utilisateur.nom}
            </h1>
            <p className={styles.subtitle}>{utilisateur.email}</p>
          </div>
          <div className={styles.headerActions}>
            <ValueBadge value={utilisateur.role} labels={ROLE_LABELS} tones={ROLE_TONES} />
            <StatutBadge statut={utilisateur.statut} />
            <UtilisateurStatutAction utilisateur={utilisateur} size="md" />
          </div>
        </header>

        <section className={styles.block} aria-labelledby="bloc-infos">
          <h2 id="bloc-infos" className={styles.blockTitle}>
            Informations
          </h2>
          <InfoList
            items={[
              { label: 'Nom', value: utilisateur.nom },
              { label: 'Prénom', value: utilisateur.prenom },
              { label: 'Email', value: utilisateur.email },
              { label: 'Téléphone', value: utilisateur.telephone },
              { label: 'Rôle', value: ROLE_LABELS[utilisateur.role] ?? utilisateur.role },
              {
                label: 'Statut du compte',
                value: utilisateur.statut === 'BLOQUE' ? 'Bloqué' : 'Actif',
              },
            ]}
          />
        </section>

        <section aria-labelledby="bloc-commandes">
          <h2 id="bloc-commandes" className={styles.blockTitle}>
            Historique des commandes ({pluralize(commandes.length, 'commande')})
          </h2>
          {commandes.length === 0 ? (
            <p className={styles.empty}>Cet utilisateur n'a passé aucune commande.</p>
          ) : (
            <DataTable
              caption="Commandes de l'utilisateur"
              columns={columns}
              rows={commandes}
              rowKey={(c) => c.id_commande}
            />
          )}
        </section>
      </section>
    </div>
  )
}