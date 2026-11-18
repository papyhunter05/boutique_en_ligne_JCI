import { useCallback, useState } from 'react'

export function useFilters(initial) {
  const [filters, setFilters] = useState(initial)

  const setFilter = useCallback(
    (key, value) => setFilters((current) => ({ ...current, [key]: value })),
    [],
  )
  const reset = useCallback(() => setFilters(initial), [initial])
  const hasActive = Object.keys(initial).some((key) => filters[key] !== initial[key])

  return { filters, setFilter, reset, hasActive }
}