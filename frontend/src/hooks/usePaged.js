import { useCallback, useMemo, useState } from 'react'

export function usePaged(items, pageSize, resetKey) {
  const [state, setState] = useState({ page: 1, key: resetKey })

  const requested = state.key === resetKey ? state.page : 1
  const lastPage = Math.max(1, Math.ceil(items.length / pageSize))
  const page = Math.min(requested, lastPage)

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  )
  const setPage = useCallback((next) => setState({ page: next, key: resetKey }), [resetKey])

  return { page, lastPage, pageItems, setPage }
}