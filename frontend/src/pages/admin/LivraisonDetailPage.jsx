import { Link, useNavigate, useParams } from 'react-router-dom'
import ValueBadge from '../../components/admin/ValueBadge'
import InfoList from '../../components/admin/InfoList'
import ArticlesTable from '../../components/admin/ArticlesTable'
import LivraisonActions from '../../components/admin/LivraisonActions'
import MouvementsTable from '../../components/admin/MouvementsTable'
import StateMessage from '../../components/common/StateMessage'
import { useLivraison } from '../../hooks/useAdminLivraisons'
import {
  COMMANDE_STATUT_LABELS,
  COMMANDE_STATUT_TONES,
  LIVRAISON_STATUT_LABELS,
  LIVRAISON_STATUT_TONES,
  MODE_LABELS,
  ZONE_LABELS,
  labelOf,
} from '../../utils/commandeFields'
import { formatDateTime, formatPrix, pluralize } from '../../utils/format'
import styles from './CommandeDetailPage.module.css' // mêmes classes que le détail d'une commande

export default function LivraisonDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: livraison, isPending, isError, error, refetch } = useLivraison(id)

  const backLink = (
    <Link to="/admin/livraisons" className={styles.back}>
      ← Retour aux livraisons
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
            aria-label="Chargement de la livraison"
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
            title={notFound ? 'Livraison introuvable.' : 'Impossible de charger la livraison.'}
            message={
              notFound ? "Cette livraison n'existe pas." : 'Vérifiez votre connexion puis réessayez.'
            }
            actionLabel={notFound ? 'Retour aux livraisons' : 'Réessayer'}
            onAction={notFound ? () => navigate('/admin/livraisons') : () => refetch()}
          />
        </section>
      </div>
    )
  }

  const commande = livraison.commande
  const client = commande?.utilisateur
  const articles = commande?.articles ?? []
  const isProvince = livraison.zone_livraison === 'PROVINCE'

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        {backLink}

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Livraison · commande {commande?.reference ?? '—'}</h1>
            <p className={styles.subtitle}>
              {labelOf(ZONE_LABELS, livraison.zone_livraison)} · créée le{' '}
              {formatDateTime(livraison.date_creation)}
            </p>
          </div>
          <div className={styles.headerActions}>
            <ValueBadge
              value={livraison.statut}
              labels={LIVRAISON_STATUT_LABELS}
              tones={LIVRAISON_STATUT_TONES}
            />
            <LivraisonActions
              livraison={livraison}
              commandeStatut={commande?.statut}
              commandeReference={commande?.reference}
              size="md"
              allowFailure
              showHint
            />
          </div>
        </header>

        <div className={styles.grid}>
          {/* Adresse copiée dans la livraison au moment de la commande :
              elle ne change pas si le client modifie son adresse enregistrée. */}
          <section className={styles.block} aria-labelledby="bloc-destinataire">
            <h2 id="bloc-destinataire" className={styles.blockTitle}>
              Destinataire et adresse
            </h2>
            <InfoList
              items={[
                { label: 'Destinataire', value: livraison.nom_destinataire },
                { label: 'Téléphone', value: livraison.telephone },
                { label: 'Région', value: livraison.region },
                { label: 'Ville', value: livraison.ville },
                { label: 'Quartier', value: livraison.quartier },
                { label: 'Adresse', value: livraison.adresse_detail },
              ]}
            />
          </section>

          <section className={styles.block} aria-labelledby="bloc-suivi">
            <h2 id="bloc-suivi" className={styles.blockTitle}>
              Suivi
            </h2>
            <InfoList
              items={[
                { label: 'Numéro de suivi', value: livraison.numero_suivi || '—' },
                { label: 'Frais de livraison', value: formatPrix(livraison.frais_livraison) },
                { label: 'Expédiée le', value: formatDateTime(livraison.date_expedition) },
                isProvince && {
                  label: "Arrivée à l'agence le",
                  value: formatDateTime(livraison.date_reception_agence),
                },
                { label: 'Livrée le', value: formatDateTime(livraison.date_livraison) },
              ].filter(Boolean)}
            />
          </section>
        </div>

        {livraison.agence && (
          <section className={styles.block} aria-labelledby="bloc-agence">
            <h2 id="bloc-agence" className={styles.blockTitle}>
              Agence de transport
            </h2>
            <InfoList
              items={[
                { label: 'Agence', value: livraison.agence.nom_agence },
                { label: 'Ville', value: livraison.agence.ville },
                { label: 'Adresse', value: livraison.agence.adresse },
                { label: 'Téléphone', value: livraison.agence.telephone },
              ]}
            />
          </section>
        )}

        {commande && (
          <section className={styles.block} aria-labelledby="bloc-commande">
            <h2 id="bloc-commande" className={styles.blockTitle}>
              Commande
            </h2>
            <InfoList
              items={[
                {
                  label: 'Référence',
                  value: (
                    <Link
                      to={`/admin/commandes/${commande.id_commande}`}
                      style={{ color: 'var(--color-teal)', fontWeight: 600 }}
                    >
                      {commande.reference}
                    </Link>
                  ),
                },
                {
                  label: 'Statut',
                  value: (
                    <ValueBadge
                      value={commande.statut}
                      labels={COMMANDE_STATUT_LABELS}
                      tones={COMMANDE_STATUT_TONES}
                    />
                  ),
                },
                { label: 'Passée le', value: formatDateTime(commande.date_commande) },
                { label: 'Mode de réception', value: labelOf(MODE_LABELS, commande.mode_reception) },
                { label: 'Total', value: formatPrix(commande.montant_total) },
                { label: 'Client', value: client ? `${client.prenom} ${client.nom}` : null },
                { label: 'Email', value: client?.email },
                { label: 'Téléphone du client', value: client?.telephone },
              ]}
            />
          </section>
        )}

        <section aria-labelledby="bloc-articles">
          <h2 id="bloc-articles" className={styles.blockTitle}>
            Articles ({pluralize(articles.length, 'ligne')})
          </h2>
          {articles.length === 0 ? (
            <p className={styles.empty}>Aucun article.</p>
          ) : (
            <ArticlesTable articles={articles} />
          )}
        </section>

        <section aria-labelledby="bloc-mouvements">
          <h2 id="bloc-mouvements" className={styles.blockTitle}>
            Mouvements de stock liés
          </h2>
          {livraison.mouvements.length === 0 ? (
            <p className={styles.empty}>Aucun mouvement de stock lié à cette commande.</p>
          ) : (
            <MouvementsTable rows={livraison.mouvements} showProduct />
          )}
        </section>
      </section>
    </div>
  )
}