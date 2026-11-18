import { useEffect, useRef } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'

export default function RequireSuperAdmin() {
  const { isSuperAdmin } = useAuth()
  const notify = useNotification()
  const notified = useRef(false)

  useEffect(() => {
    if (!isSuperAdmin && !notified.current) {
      notified.current = true
      notify.error('Cette page est réservée au super administrateur.')
    }
  }, [isSuperAdmin, notify])

  if (!isSuperAdmin) return <Navigate to="/admin" replace />

  return <Outlet />
}