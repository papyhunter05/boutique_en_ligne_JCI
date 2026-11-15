import { Link } from 'react-router-dom'
import DataTable from './DataTable'
import MouvementTypeBadge from './MouvementTypeBadge'
import { formatDateTime, formatVariante } from '../../utils/format'
import styles from './MouvementsTable.module.css'

// Le signe n'est affiché que pour les types connus
function Quantite({ type, value }) {
  if (type === 'ENTREE') return <strong className={styles.plus}>+{value}</strong>
  if (type === 'SORTIE') return <strong className={styles.minus}>−{value}</strong>
  return <strong>{value}</strong>
}

export default function MouvementsTable({ rows, showProduct = false }) {
  // La colonne Commande n'apparaît que si au moins un mouvement est lié à une commande
  const hasCommande = rows.some((row) => row.id_commande)

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (r) =>
        r.date ? (
          <time dateTime={r.date} className={styles.date}>
            {formatDateTime(r.date)}
          </time>
        ) : (
          '—'
        ),
    },
    { key: 'type', header: 'Type', render: (r) => <MouvementTypeBadge type={r.type_mouvement} /> },
    showProduct && {
      key: 'produit',
      header: 'Produit',
      mobile: 'title',
      render: (r) => (
        <div className={styles.product}>
          <strong>{r.produit}</strong>
          <Link to={`/admin/stock/variantes/${r.variante.id_variante}`} className={styles.link}>
            {formatVariante(r.variante)} · {r.variante.sku}
          </Link>
        </div>
      ),
    },
    {
      key: 'quantite',
      header: 'Quantité',
      align: 'center',
      render: (r) => <Quantite type={r.type_mouvement} value={r.quantite} />,
    },
    { key: 'motif', header: 'Motif', render: (r) => r.motif || '—' },
    {
      key: 'admin',
      header: 'Effectué par',
      render: (r) =>
        r.administrateur ? `${r.administrateur.prenom} ${r.administrateur.nom}` : '—',
    },
    hasCommande && {
      key: 'commande',
      header: 'Commande',
      render: (r) => (r.id_commande ? `#${r.id_commande}` : '—'),
    },
  ].filter(Boolean)

  return (
    <DataTable
      caption="Historique des mouvements de stock"
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id_mouvement}
    />
  )
}