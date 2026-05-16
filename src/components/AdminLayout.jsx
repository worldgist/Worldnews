import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { loadProfile } from '../admin/storage'
import { useAdminAuth } from '../context/AdminAuthContext'

const ADMIN_MENU = [
  { to: '/admin/overview', label: 'Overview' },
  { to: '/admin/add-category', label: 'Add Category' },
  { to: '/admin/categories', label: 'Categories Management' },
  { to: '/admin/posts', label: 'News Post Editor' },
  { to: '/admin/scheduled-posts', label: 'Scheduled Posts' },
  { to: '/admin/social-media', label: 'Social Media Management' },
  { to: '/admin/profile', label: 'Admin Profile' },
  { to: '/admin/settings', label: 'Admin Settings' },
  { to: '/admin/form-inbox', label: 'Form Inbox' },
  { to: '/admin/newsletter', label: 'Newsletter' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const { signOut, user } = useAdminAuth()
  const profile = loadProfile()

  const closeSidebar = () => setSidebarOpen(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <main className="admin-fullscreen">
      <button
        type="button"
        className={`admin-overlay${sidebarOpen ? ' open' : ''}`}
        aria-label="Close admin menu"
        onClick={closeSidebar}
      />

      <header className="admin-topbar">
        <button type="button" className="admin-menu-btn" onClick={() => setSidebarOpen((v) => !v)}>
          Menu
        </button>
        <div>
          <p className="kicker">Admin Panel</p>
          <h1>World Gist News Admin</h1>
          {profile.avatarUrl ? (
            <img className="admin-topbar-avatar" src={profile.avatarUrl} alt="" />
          ) : null}
          {user?.email ? <p className="admin-topbar-user">{user.email}</p> : null}
        </div>
      </header>

      <div className="admin-shell">
        <aside className={`admin-sidebar-panel${sidebarOpen ? ' open' : ''}`} aria-label="Admin menu">
          {ADMIN_MENU.map((item) => (
            <NavLink key={item.to} to={item.to} className="admin-menu-link" onClick={closeSidebar}>
              {item.label}
            </NavLink>
          ))}
          <div className="admin-sidebar-footer">
            <button type="button" className="admin-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>

        <section className="admin-content-panel" aria-label="Admin content">
          <Outlet />
        </section>
      </div>
    </main>
  )
}
