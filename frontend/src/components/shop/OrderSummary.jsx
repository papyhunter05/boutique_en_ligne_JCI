import { formatPrix } from '../../utils/format'
import styles from './OrderSummary.module.css'

// fraisLivraison : un nombre quand il est connu (étapes suivantes), sinon non fourni
export default function OrderSummary({ articles, subtotal, fraisLivraison }) {
  const hasFrais = typeof fraisLivraison === 'number'
  const total = Number(subtotal) + (hasFrais ? fraisLivraison : 0)

  return (
    <aside className={styles.summary} aria-labelledby="summary-title">
      <h2 id="summary-title" className={styles.title}>
        Résumé de la commande
      </h2>

      {articles.length > 0 && (
        <ul className={styles.lines}>
          {articles.map((article) => (
            <li key={article.id_panier_article}>
              <span>
                {article.nom_produit} <small>× {article.quantite}</small>
              </span>
              <strong>{formatPrix(article.sous_total)}</strong>
            </li>
          ))}
        </ul>
      )}

      <dl className={styles.totals}>
        <div>
          <dt>Sous-total</dt>
          <dd>{formatPrix(subtotal)}</dd>
        </div>
        <div>
          <dt>Livraison</dt>
          <dd>{hasFrais ? formatPrix(fraisLivraison) : "Calculée à l'étape suivante"}</dd>
        </div>
        <div className={styles.grand}>
          <dt>Total</dt>
          <dd>{formatPrix(total)}</dd>
        </div>
      </dl>

      {!hasFrais && (
        <p className={styles.note}>Les frais de livraison dépendent du mode de réception choisi.</p>
      )}
    </aside>
  )
}