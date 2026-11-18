import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DataTable from '../../components/admin/DataTable'
import ValueBadge from '../../components/admin/ValueBadge'
import DeliverButton from '../../components/admin/DeliverButton'
import MouvementsTable from '../../components/admin/MouvementsTable'
import StateMessage from '../../components/common/StateMessage'
import { useCommande } from '../../hooks/useAdminCommandes'
import {
  COMMANDE_STATUT_LABELS,
  COMMANDE_STATUT_TONES,
  LIVRAISON_STATUT_LABELS,
  LIVRAISON_STATUT_TONES,
  MODE_LABELS,
  ZONE_LABELS,
  getPrixUnitaire,
  getQuantite,
  getSousTotal,
  labelOf,
} from '../../utils/commandeFields'
import { formatDateTime, formatPrix, formatVariante, pluralize } from '../../utils/format'
import styles from './CommandeDetailPage.module.css'

// Liste « libellé : valeur » ; les valeurs vides sont ignorées
function InfoList({ items }) {
  const visible = items.filter(
    (item) => item.value !== null && item.value !== undefined && item.value !== '',
  )
  if (visible.length === 0) return <p className={styles.empty}>Aucune information.</p>

  return (
    <dl className={styles.info}>
      {visible.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function CommandeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: commande, isPending, isError, error, refetch } = useCommande(id)

  const articles = useMemo(
    () =>
      (commande?.articles ?? []).map((article, index) => ({
        ...article,
        _key: `${article.id_variante ?? 'article'}-${index}`,
      })),
    [commande],
  )

  const backLink = (
    <Link to="/admin/commandes" className={styles.back}>
      ← Retour aux commandes
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
            aria-label="Chargement de la commande"
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
            title={notFound ? 'Commande introuvable.' : 'Impossible de charger la commande.'}
            message={
              notFound ? "Cette commande n'existe pas." : 'Vérifiez votre connexion puis réessayez.'
            }
            actionLabel={notFound ? 'Retour aux commandes' : 'Réessayer'}
            onAction={notFound ? () => navigate('/admin/commandes') : () => refetch()}
          />
        </section>
      </div>
    )
  }

  const client = commande.utilisateur
  const livraison = commande.livraison
  const isProvince = livraison?.zone_livraison === 'PROVINCE'

  // Ces colonnes n'apparaissent que si le backend envoie les montants
  const hasPrix = articles.some((a) => getPrixUnitaire(a) !== null)
  const hasSousTotal = articles.some((a) => getSousTotal(a) !== null)

  const articleColumns = [
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
    hasPrix && {
      key: 'prix',
      header: 'Prix unitaire',
      render: (a) => formatPrix(getPrixUnitaire(a)),
    },
    hasSousTotal && {
      key: 'sousTotal',
      header: 'Sous-total',
      render: (a) => formatPrix(getSousTotal(a)),
    },
  ].filter(Boolean)

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        {backLink}

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Commande {commande.reference}</h1>
            <p className={styles.subtitle}>Passée le {formatDateTime(commande.date_commande)}</p>
          </div>
          <div className={styles.headerActions}>
            <ValueBadge
              value={commande.statut}
              labels={COMMANDE_STATUT_LABELS}
              tones={COMMANDE_STATUT_TONES}
            />
            <DeliverButton size="md" />
          </div>
        </header>

        <div className={styles.grid}>
          <section className={styles.block} aria-labelledby="bloc-client">
            <h2 id="bloc-client" className={styles.blockTitle}>
              Client
            </h2>
            {client ? (
              <InfoList
                items={[
                  { label: 'Nom', value: `${client.prenom} ${client.nom}` },
                  { label: 'Email', value: client.email },
                  { label: 'Téléphone', value: client.telephone },
                ]}
              />
            ) : (
              <p className={styles.empty}>Client indisponible.</p>
            )}
          </section>

          <section className={styles.block} aria-labelledby="bloc-commande">
            <h2 id="bloc-commande" className={styles.blockTitle}>
              Commande
            </h2>
            <InfoList
              items={[
                { label: 'Mode de réception', value: labelOf(MODE_LABELS, commande.mode_reception) },
                { label: 'Lieu de retrait', value: commande.lieu_retrait },
                { label: 'Montant des articles', value: formatPrix(commande.montant_articles) },
                { label: 'Frais de livraison', value: formatPrix(commande.frais_livraison) },
                { label: 'Total', value: formatPrix(commande.montant_total) },
                {
                  label: 'Expiration du paiement',
                  // Seulement tant que la commande attend son paiement
                  value:
                    commande.statut === 'EN_ATTENTE_PAIEMENT' && commande.date_expiration_paiement
                      ? formatDateTime(commande.date_expiration_paiement)
                      : null,
                },
                {
                  label: 'Dernière modification',
                  value: formatDateTime(commande.date_modification),
                },
              ]}
            />
          </section>
        </div>

        <section aria-labelledby="bloc-articles">
          <h2 id="bloc-articles" className={styles.blockTitle}>
            Articles ({pluralize(articles.length, 'ligne')})
          </h2>
          {articles.length === 0 ? (
            <p className={styles.empty}>Aucun article.</p>
          ) : (
            <DataTable
              caption="Articles de la commande"
              columns={articleColumns}
              rows={articles}
              rowKey={(a) => a._key}
            />
          )}
        </section>

        <section className={styles.block} aria-labelledby="bloc-livraison">
          <h2 id="bloc-livraison" className={styles.blockTitle}>
            Livraison
          </h2>

          {livraison ? (
            <div className={styles.delivery}>
              <div className={styles.deliveryStatus}>
                <span>Statut de la livraison</span>
                <ValueBadge
                  value={livraison.statut}
                  labels={LIVRAISON_STATUT_LABELS}
                  tones={LIVRAISON_STATUT_TONES}
                />
              </div>

              {/* Adresse copiée dans la livraison au moment de la commande :
                  elle ne change pas si le client modifie son adresse enregistrée. */}
              <InfoList
                items={[
                  { label: 'Zone', value: labelOf(ZONE_LABELS, livraison.zone_livraison) },
                  { label: 'Destinataire', value: livraison.nom_destinataire },
                  { label: 'Téléphone', value: livraison.telephone },
                  { label: 'Région', value: livraison.region },
                  { label: 'Ville', value: livraison.ville },
                  { label: 'Quartier', value: livraison.quartier },
                  { label: 'Adresse', value: livraison.adresse_detail },
                  { label: 'Lieu de retrait', value: livraison.lieu_retrait },
                ]}
              />

              <div>
                <h3 className={styles.subTitle}>Suivi</h3>
                <InfoList
                  items={[
                    { label: 'Numéro de suivi', value: livraison.numero_suivi || '—' },
                    { label: 'Créée le', value: formatDateTime(livraison.date_creation) },
                    { label: 'Expédiée le', value: formatDateTime(livraison.date_expedition) },
                    isProvince && {
                      label: "Arrivée à l'agence le",
                      value: formatDateTime(livraison.date_reception_agence),
                    },
                    { label: 'Livrée le', value: formatDateTime(livraison.date_livraison) },
                  ].filter(Boolean)}
                />
              </div>

              {livraison.agence && (
                <div>
                  <h3 className={styles.subTitle}>Agence de transport</h3>
                  <InfoList
                    items={[
                      { label: 'Agence', value: livraison.agence.nom_agence },
                      { label: 'Ville', value: livraison.agence.ville },
                      { label: 'Adresse', value: livraison.agence.adresse },
                      { label: 'Téléphone', value: livraison.agence.telephone },
                    ]}
                  />
                </div>
              )}
            </div>
          ) : (
            <p className={styles.empty}>
              {commande.mode_reception === 'RETRAIT_MAGASIN'
                ? `Retrait au magasin${commande.lieu_retrait ? ` : ${commande.lieu_retrait}` : ''}. Aucune livraison n'est associée à cette commande.`
                : 'Aucune livraison associée à cette commande.'}
            </p>
          )}
        </section>

        <section aria-labelledby="bloc-mouvements">
          <h2 id="bloc-mouvements" className={styles.blockTitle}>
            Mouvements de stock liés
          </h2>
          {commande.mouvements.length === 0 ? (
            <p className={styles.empty}>Aucun mouvement de stock lié à cette commande.</p>
          ) : (
            <MouvementsTable rows={commande.mouvements} showProduct />
          )}
        </section>
      </section>
    </div>
  )
}