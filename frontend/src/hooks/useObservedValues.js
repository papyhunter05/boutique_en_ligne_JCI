import { useState } from 'react'

export function useObservedValues(values) {
  const [seen, setSeen] = useState(() => new Set())

  const missing = values.filter((value) => value && !seen.has(value))
  // Ajustement pendant le rendu, autorisé par React : la condition évite toute boucle
  if (missing.length > 0) setSeen(new Set([...seen, ...missing]))

  return [...seen]
}