import StatusBadge from '../ui/StatusBadge'

const KNOWN = {
  ENTREE: { tone: 'success', label: 'Entrée' },
  SORTIE: { tone: 'warning', label: 'Sortie' },
}

export default function MouvementTypeBadge({ type }) {
  const known = KNOWN[type]
  return (
    <StatusBadge tone={known?.tone ?? 'neutral'}>{known?.label ?? type ?? '—'}</StatusBadge>
  )
}