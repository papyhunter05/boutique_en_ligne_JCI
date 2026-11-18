import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'

import './styles/tokens.css'
import './styles/global.css'

import ErrorBoundary from './components/common/ErrorBoundary.jsx'

import AuthModalProvider from './context/AuthModalProvider.jsx'
import NotificationProvider from './context/NotificationProvider.jsx'
import AuthProvider from './context/AuthProvider.jsx'
import App from './app/App.jsx'
import ProductModalProvider from './context/ProductModalProvider.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // Inutile de réessayer une erreur 4xx : elle se reproduira
      retry: (failureCount, error) => {
        const status = error?.response?.status
        if (status && status < 500) return false
        return failureCount < 1
      },
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <NotificationProvider>
            <AuthProvider>
              <AuthModalProvider>
                <ProductModalProvider>
                  <App />
                </ProductModalProvider>
              </AuthModalProvider>
            </AuthProvider>
          </NotificationProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)