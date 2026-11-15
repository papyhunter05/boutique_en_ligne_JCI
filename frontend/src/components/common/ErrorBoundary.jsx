import { Component } from 'react'
import StateMessage from './StateMessage'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // Détails techniques visibles en développement seulement
    if (import.meta.env.DEV) console.error(error, info.componentStack)
  }

  // Quand la clé change (navigation vers une autre page), on réessaie d'afficher
  componentDidUpdate(previousProps) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{ padding: 'var(--space-6)' }}>
        <StateMessage
          isError
          title="Une erreur est survenue."
          message="Cette page n'a pas pu s'afficher. Rechargez la page, ou revenez à l'accueil."
          actionLabel="Recharger la page"
          onAction={() => window.location.reload()}
        />
      </div>
    )
  }
}