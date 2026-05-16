import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const ADMIN_USER = 'admin'
const ADMIN_PASS = 'worldnews123'
const ADMIN_AUTH_KEY = 'worldnews-admin-auth'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = (e) => {
    e.preventDefault()

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
        <label htmlFor="adminUsername">Username</label>
        <input
          id="adminUsername"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          required
        />

        <label htmlFor="adminPassword">Password</label>
        <input
          id="adminPassword"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
        />

        {error && <p className="admin-auth-error">{error}</p>}

        <button type="submit">Login</button>
      </form>

      <p className="admin-auth-hint">
        Demo credentials: <strong>admin</strong> / <strong>worldnews123</strong>
      </p>

      <Link className="read-more" to="/">
        Back to homepage
      </Link>
    </main>
  )
}
