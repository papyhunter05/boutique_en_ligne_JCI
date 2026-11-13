import { useCallback, useMemo, useRef, useState } from 'react'
import { NotificationContext } from './NotificationContext'
import ToastContainer from '../components/common/ToastContainer'

const DURATION_MS = 5000

export default function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(1)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    (type, message) => {
      const id = nextId.current++
      setToasts((current) => [...current, { id, type, message }])
      setTimeout(() => dismiss(id), DURATION_MS)
    },
    [dismiss],
  )

  const value = useMemo(
    () => ({
      success: (message) => notify('success', message),
      error: (message) => notify('error', message),
      info: (message) => notify('info', message),
    }),
    [notify],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </NotificationContext.Provider>
  )
}