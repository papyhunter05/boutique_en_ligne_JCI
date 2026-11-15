import { useLocation } from 'react-router-dom'
import ErrorBoundary from './ErrorBoundary'

// Se réinitialise quand on change de page
export default function RouteErrorBoundary({ children }) {
  const { pathname } = useLocation()
  return <ErrorBoundary resetKey={pathname}>{children}</ErrorBoundary>
}