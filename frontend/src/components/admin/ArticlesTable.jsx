import { useMemo } from 'react'
import DataTable from './DataTable'
import { getPrixUnitaire, getQuantite, getSousTotal } from '../../utils/commandeFields'
import { formatPrix, formatVariante } from '../../utils/format'
import styles from './ArticlesTable.module.css'

export default function ArticlesTable({ articles }) {
  const rows = useMemo(
    () => articles.map((a, index) => ({ ...a, _key: `${a.id_variante ?? 'article'}-${index}` })),
    [articles],
  )

  // Ces colonnes n'apparaissent que si le backend envoie les montants
  const hasPrix = rows.some((a) => getPrixUnitaire(a) !== null)
  const hasSousTotal = rows.some((a) => getSousTotal(a) !== null)

  const columns = [
    {
      key: 'produit',
      header: 'Produit',
      mobile: 'title',
      render: (a) => (
        <div className={styles.product}>
          <strong>{a.variante?.produit?.nom_produit ?? 'Produit'}</strong>
          <span>{a.variante ? `${formatVariante(a.variante)} · ${a.variante.sku}` : '—'}</span>
        </div>
      ),
    },
    { key: 'quantite', header: 'Quantité', align: 'center', render: (a) => getQuantite(a) ?? '—' },
    hasPrix && { key: 'prix', header: 'Prix unitaire', render: (a) => formatPrix(getPrixUnitaire(a)) },
    hasSousTotal && { key: 'sousTotal', header: 'Sous-total', render: (a) => formatPrix(getSousTotal(a)) },
  ].filter(Boolean)

  return (
    <DataTable
      caption="Articles de la commande"
      columns={columns}
      rows={rows}
      rowKey={(a) => a._key}
    />
  )
}