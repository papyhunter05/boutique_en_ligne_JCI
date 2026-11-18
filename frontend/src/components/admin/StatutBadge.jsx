import StatusBadge from '../ui/StatusBadge'

// Les agences utilisent ACTIVE / INACTIVE, les comptes ACTIF / BLOQUE, le reste ACTIF / INACTIF
const LABELS = {
  ACTIF: { tone: 'success', label: 'Actif' },
  INACTIF: { tone: 'neutral', label: 'Inactif' },
  ACTIVE: { tone: 'success', label: 'Active' },
  INACTIVE: { tone: 'neutral', label: 'Inactive' },
  BLOQUE: { tone: 'danger', label: 'Bloqué' },
}

export default function StatutBadge({ statut }) {
  const known = LABELS[statut]
  return <StatusBadge tone={known?.tone ?? 'warning'}>{known?.label ?? statut ?? '—'}</StatusBadge>
}