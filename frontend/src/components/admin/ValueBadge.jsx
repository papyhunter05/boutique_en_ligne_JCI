import StatusBadge from '../ui/StatusBadge'
import { labelOf } from '../../utils/commandeFields'

// Badge générique pour une valeur de statut dont on connaît (ou non) le libellé et la couleur
export default function ValueBadge({ value, labels = {}, tones = {} }) {
  if (!value) return <>—</>
  return <StatusBadge tone={tones[value] ?? 'neutral'}>{labelOf(labels, value)}</StatusBadge>
}