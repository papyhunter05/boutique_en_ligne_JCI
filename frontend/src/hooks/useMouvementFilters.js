import { useMemo } from 'react'
import { useFilters } from './useFilters'
import { buildTypeOptions } from '../utils/filterOptions'
import { isWithinDates, matchesSearch } from '../utils/filters'

const INITIAL = { search: '', type: '', from: '', to: '' }

export function useMouvementFilters(items) {
  const state = useFilters(INITIAL)
  const { filters } = state

  const filtered = useMemo(
    () =>
      items.filter(
        (m) =>
          matchesSearch(filters.search, [
            m.produit,
            m.variante?.modele,
            m.variante?.taille,
            m.variante?.sku,
            m.motif,
            m.administrateur && `${m.administrateur.prenom} ${m.administrateur.nom}`,
            m.id_commande ? `#${m.id_commande}` : null,
          ]) &&
          (!filters.type || m.type_mouvement === filters.type) &&
          isWithinDates(m.date, filters.from, filters.to),
      ),
    [items, filters],
  )

  const typeOptions = useMemo(() => buildTypeOptions(items), [items])

  return { ...state, filtered, typeOptions }
}