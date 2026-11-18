import { Link } from 'react-router-dom'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import StatutBadge from '../../components/admin/StatutBadge'
import StateMessage from '../../components/common/StateMessage'
import ProductImage from '../../components/shop/ProductImage'
import { useVariantes } from '../../hooks/useAdminVariantes'
import { summarizeStock } from '../../utils/stock'
import { formatDateTime, formatPrix, formatVariante, pluralize } from '../../utils/format'
import styles from './ProduitInfoModal.module.css'

function ProduitInfo({ produit, onClose }) {
  // Les variantes ne sont chargées que pendant que la fiche est ouverte
  const { data, isPending, isError, refetch } = useVariantes(produit.id_produit)
  const variantes = data?.variantes ?? []
  const stock = summarizeStock(variantes)

  return (
    <div className={styles.content}>
      <section className={styles.identity}>
        <div className={styles.image}>
          <ProductImage src={produit.image} />
        </div>
        <div className={styles.identityText}>
          <div className={styles.titleRow}>
            <h3 className={styles.name}>{produit.nom_produit}</h3>
            <StatutBadge statut={produit.statut} />
          </div>
          <p className={styles.description}>{produit.description || 'Aucune description.'}</p>
        </div>
      </section>

      <dl className={styles.details}>
        <div>
          <dt>Catégorie</dt>
          <dd>{produit.categorie?.nom_categorie ?? '—'}</dd>
        </div>
        <div>
          <dt>Prix</dt>
          <dd>{formatPrix(produit.prix)}</dd>
        </div>
        <div>
          <dt>Variantes</dt>
          <dd>{data ? variantes.length : (produit.variantes_count ?? '—')}</dd>
        </div>
        <div>
          <dt>Créé le</dt>
          <dd>{formatDateTime(produit.date_creation)}</dd>
        </div>
        <div>
          <dt>Modifié le</dt>
          <dd>{formatDateTime(produit.date_modification)}</dd>
        </div>
      </dl>

      <section aria-labelledby="info-stock">
        <h4 id="info-stock" className={styles.sectionTitle}>
          Stock
        </h4>

        {isPending ? (
          <span className={styles.skeleton} aria-busy="true" />
        ) : isError ? (
          <StateMessage
            isError
            title="Impossible de charger le stock."
            actionLabel="Réessayer"
            onAction={() => refetch()}
          />
        ) : (
          <>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span>Stock total</span>
                <strong>{stock.total}</strong>
              </div>
              <div className={styles.stat}>
                <span>Réservé</span>
                <strong>{stock.reserve}</strong>
              </div>
              <div className={styles.stat}>
                <span>Disponible</span>
                <strong>{stock.disponible}</strong>
              </div>
            </div>
            {stock.inactives > 0 && (
              <p className={styles.note}>
                Ces totaux incluent {pluralize(stock.inactives, 'variante inactive', 'variantes inactives')}.
              </p>
            )}
          </>
        )}
      </section>

      {!isPending && !isError && (
        <section aria-labelledby="info-variantes">
          <h4 id="info-variantes" className={styles.sectionTitle}>
            Variantes ({variantes.length})
          </h4>

          {variantes.length === 0 ? (
            <p className={styles.note}>Ce produit n'a aucune variante pour le moment.</p>
          ) : (
            <ul className={styles.variants}>
              {variantes.map((v) => (
                <li key={v.id_variante} className={styles.variant}>
                  <div className={styles.thumb}>
                    <ProductImage src={v.image} />
                  </div>

                  <div className={styles.variantMain}>
                    <strong>{formatVariante(v)}</strong>
                    <code className={styles.sku}>{v.sku}</code>
                  </div>

                  <dl className={styles.variantStock}>
                    <div>
                      <dt>Total</dt>
                      <dd>{v.quantite_stock}</dd>
                    </div>
                    <div>
                      <dt>Réservé</dt>
                      <dd>{v.quantite_reservee}</dd>
                    </div>
                    <div>
                      <dt>Disponible</dt>
                      <dd>
                        <strong>{v.stock_disponible}</strong>
                      </dd>
                    </div>
                  </dl>

                  <div className={styles.variantSide}>
                    <StatutBadge statut={v.statut} />
                    <Link to={`/admin/stock/variantes/${v.id_variante}`} className={styles.link}>
                      Historique
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <div className={styles.actions}>
        <Button variant="soft" onClick={onClose}>
          Fermer
        </Button>
        <Button as={Link} to={`/admin/produits/${produit.id_produit}/variantes`} variant="accent">
          Gérer les variantes
        </Button>
      </div>
    </div>
  )
}

export default function ProduitInfoModal({ isOpen, produit, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Informations sur le produit">
      {produit && <ProduitInfo produit={produit} onClose={onClose} />}
    </Modal>
  )
}