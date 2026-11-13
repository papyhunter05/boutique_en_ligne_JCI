import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
      <h1>Page introuvable</h1>
      <p style={{ margin: 'var(--space-3) 0' }}>Cette page n'existe pas.</p>
      <Link to="/" style={{ color: 'var(--color-blue)', fontWeight: 600 }}>
        Retour à l'accueil
      </Link>
    </main>
  )
}