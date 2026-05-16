import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, loading } = useAdminAuth()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const nextPath = location.state?.from?.pathname || '/admin/overview'
      navigate(nextPath, { replace: true })
    }
  }, [isAuthenticated, loading, location.state, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!supabase) {
      setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      return
    }

    setSubmitting(true)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setSubmitting(false)

    if (authError) {
      setError(authError.message || 'Could not sign in. Check email and password.')
      return
    }

    const nextPath = location.state?.from?.pathname || '/admin/overview'
    navigate(nextPath, { replace: true })
  }

  if (loading) {
    return (
      <main className="container static-page admin-auth-page">
        <p className="page-empty">Checking session…</p>
      </main>
    )
  }

  if (!isSupabaseConfigured || !supabase) {
    return (
      <main className="container static-page admin-auth-page">
        <p className="kicker">Admin</p>
        <h1>Admin Login</h1>
        <p className="admin-auth-error">
          Supabase Auth is required for admin access. Add your project URL and anon key to the environment.
        </p>
        <Link className="read-more" to="/">
          Back to homepage
        </Link>
      </main>
    )
  }

  return (
    <main className="container static-page admin-auth-page">
      <p className="kicker">Admin</p>
      <h1>Admin Login</h1>
      <p>Sign in with your Supabase account to access the World Gist News admin dashboard.</p>

      <form className="admin-auth-form" onSubmit={handleSubmit}>
        <label htmlFor="adminEmail">Email address</label>
        <input
          id="adminEmail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@worldgistnews.com"
          autoComplete="email"
          required
        />

        <label htmlFor="adminPassword">Password</label>
        <input
          id="adminPassword"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          autoComplete="current-password"
          required
        />

        {error ? <p className="admin-auth-error">{error}</p> : null}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="admin-auth-hint">
        Accounts are managed in <strong>Supabase → Authentication → Users</strong>. Create an editor there, then sign in
        with that email and password.
      </p>

      <Link className="read-more" to="/">
        Back to homepage
      </Link>
    </main>
  )
}
