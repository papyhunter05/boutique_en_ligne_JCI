import LivraisonActions from './LivraisonActions'

// Action suivante de la livraison de la commande. Rien pour un retrait au magasin
// (pas de livraison), une commande annulée ou une livraison terminée.
export default function DeliverButton({ commande, size = 'sm' }) {
  if (!commande?.livraison) return null

  return (
    <LivraisonActions
      livraison={commande.livraison}
      commandeStatut={commande.statut}
      commandeReference={commande.reference}
      size={size}
    />
  )
}