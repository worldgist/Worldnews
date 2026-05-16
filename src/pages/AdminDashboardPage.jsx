import { Link, useNavigate } from 'react-router-dom'
import { articles, categories } from '../data/feed'

const ADMIN_AUTH_KEY = 'worldnews-admin-auth'

export default function AdminDashboardPage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_AUTH_KEY)
    navigate('/admin/login', { replace: true })
  }

  return (
    <main className="container static-page admin-dashboard-page">
      <div className="admin-dashboard-head">
        <div>
          <p className="kicker">Admin Panel</p>
          <h1>Admin Dashboard</h1>
          <p>Manage content sections and monitor publication activity.</p>
        </div>
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <section className="admin-metrics" aria-label="Dashboard metrics">
        <article>
          <h2>{articles.length}</h2>
          <p>Total Articles</p>
        </article>
        <article>
          <h2>{categories.length}</h2>
          <p>Active Categories</p>
        </article>
        <article>
          <h2>{articles.filter((story) => story.featured).length}</h2>
          <p>Featured Stories</p>
        </article>
      </section>

      <section className="admin-quick-links" aria-label="Admin quick links">
        <h3>Quick Access</h3>
        <div>
          <Link to="/">View Landing Page</Link>
          {categories.map((cat) => (
            <Link key={cat} to={`/category/${cat.toLowerCase()}`}>
              {cat} Section
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
