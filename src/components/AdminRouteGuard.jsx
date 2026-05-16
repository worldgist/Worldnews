import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import { isSupabaseConfigured } from '../lib/supabaseClient'

export function RequireAdmin({ children }) {
  const { isAuthenticated, loading } = useAdminAuth()
  const location = useLocation()

  if (!isSupabaseConfigured) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  if (loading) {
    return (
      <main className="container static-page admin-auth-page">
        <p className="page-empty">Checking session…</p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return children
}

export function RedirectIfAdminAuthenticated({ children }) {
  const { isAuthenticated, loading } = useAdminAuth()

  if (loading) {
    return (
      <main className="container static-page admin-auth-page">
        <p className="page-empty">Checking session…</p>
      </main>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/admin/overview" replace />
  }

  return children
}
