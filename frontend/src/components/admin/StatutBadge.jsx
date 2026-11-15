import StatusBadge from '../ui/StatusBadge'

export default function StatutBadge({ statut }) {
  if (statut === 'ACTIF') return <StatusBadge tone="success">Actif</StatusBadge>
  if (statut === 'INACTIF') return <StatusBadge tone="neutral">Inactif</StatusBadge>
  return <StatusBadge tone="warning">{statut}</StatusBadge>
}