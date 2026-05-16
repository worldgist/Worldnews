import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const ADMIN_USER = 'admin'
const ADMIN_PASS = 'worldnews123'
const ADMIN_AUTH_KEY = 'worldnews-admin-auth'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (supabase) {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: username.trim(),
        password,
      })
      if (!authError) {
        localStorage.setItem(ADMIN_AUTH_KEY, 'true')
        const nextPath = location.state?.from?.pathname || '/admin/overview'
        navigate(nextPath, { replace: true })
        return
      }
      setError(authError.message || 'Could not sign in. Check email and password.')
      return
    }

    if (username.trim() === ADMIN_USER && password === ADMIN_PASS) {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true')
      const nextPath = location.state?.from?.pathname || '/admin/overview'
      navigate(nextPath, { replace: true })
      return
    }

    setError('Invalid login details. Please check your username and password.')
  }

  return (
    <main className="container static-page admin-auth-page">
      <p className="kicker">Admin</p>
      <h1>Admin Login</h1>
      <p>Sign in to access the World Gist News admin dashboard.</p>

      <form className="admin-auth-form" onSubmit={handleSubmit}>
        <label htmlFor="adminUsername">{supabase ? 'Email address' : 'Username'}</label>
        <input
          id="adminUsername"
          type={supabase ? 'email' : 'text'}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={supabase ? 'you@company.com' : 'Enter username'}
          autoComplete={supabase ? 'email' : 'username'}
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

        {error && <p className="admin-auth-error">{error}</p>}

        <button type="submit">Login</button>
      </form>

      {supabase ? (
        <p className="admin-auth-hint">
          Use a user from <strong>Supabase → Authentication → Users</strong> (email sign-in). Create one there if you have
          not already.
        </p>
      ) : (
        <p className="admin-auth-hint">
          Demo credentials (no Supabase env): <strong>admin</strong> / <strong>worldnews123</strong>
        </p>
      )}

      <Link className="read-more" to="/">
        Back to homepage
      </Link>
    </main>
  )
}
