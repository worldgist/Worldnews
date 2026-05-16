import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import ArticlePage from './pages/ArticlePage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import AdvertisePage from './pages/AdvertisePage'
import SubmitNewsPage from './pages/SubmitNewsPage'
import TermsPage from './pages/TermsPage'
import WorldNewsPage from './pages/WorldNewsPage'
import PoliticsNewsPage from './pages/PoliticsNewsPage'
import SportsNewsPage from './pages/SportsNewsPage'
import SchoolNewsPage from './pages/SchoolNewsPage'
import TechnologyNewsPage from './pages/TechnologyNewsPage'
import EntertainmentNewsPage from './pages/EntertainmentNewsPage'
import SearchResultsPage from './pages/SearchResultsPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminLayout from './components/AdminLayout'
import AdminOverviewPage from './pages/admin/AdminOverviewPage'
import AdminAddCategoryPage from './pages/admin/AdminAddCategoryPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminPostsPage from './pages/admin/AdminPostsPage'
import AdminSocialMediaPage from './pages/admin/AdminSocialMediaPage'
import AdminProfilePage from './pages/admin/AdminProfilePage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import './App.css'

const ADMIN_AUTH_KEY = 'worldnews-admin-auth'
const SETTINGS_STORAGE_KEY = 'worldnews-admin-settings'
const DEFAULT_SITE_NAME = 'World Gist News'

function isAdminAuthenticated() {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(ADMIN_AUTH_KEY) === 'true'
}

function RequireAdmin({ children }) {
  const location = useLocation()

  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return children
}

export default function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  useEffect(() => {
    const syncSiteTitle = () => {
      try {
        const saved = localStorage.getItem(SETTINGS_STORAGE_KEY)
        if (!saved) {
          document.title = DEFAULT_SITE_NAME
          return
        }

        const parsed = JSON.parse(saved)
        document.title = parsed?.siteName?.trim() || DEFAULT_SITE_NAME
      } catch {
        document.title = DEFAULT_SITE_NAME
      }
    }

    syncSiteTitle()
    window.addEventListener('storage', syncSiteTitle)
    return () => window.removeEventListener('storage', syncSiteTitle)
  }, [])

  return (
    <div className="app-shell">
      <div className="page-bg" />
      {!isAdminRoute && <SiteHeader />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/article/:id" element={<ArticlePage />} />
        <Route path="/world-news" element={<WorldNewsPage />} />
        <Route path="/politics-news" element={<PoliticsNewsPage />} />
        <Route path="/sports-news" element={<SportsNewsPage />} />
        <Route path="/school-news" element={<SchoolNewsPage />} />
        <Route path="/technology-news" element={<TechnologyNewsPage />} />
        <Route path="/entertainment-news" element={<EntertainmentNewsPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/about-us" element={<AboutPage />} />
        <Route path="/contact-us" element={<ContactPage />} />
        <Route path="/advertise" element={<AdvertisePage />} />
        <Route path="/submit-news" element={<SubmitNewsPage />} />
        <Route path="/terms-and-conditions" element={<TermsPage />} />
        <Route
          path="/admin/login"
          element={
            isAdminAuthenticated() ? <Navigate to="/admin/overview" replace /> : <AdminLoginPage />
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AdminOverviewPage />} />
          <Route path="add-category" element={<AdminAddCategoryPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="posts" element={<AdminPostsPage />} />
          <Route path="social-media" element={<AdminSocialMediaPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
        <Route path="/admin/dashboard" element={<Navigate to="/admin/overview" replace />} />
      </Routes>
      {!isAdminRoute && <SiteFooter />}
    </div>
  )
}
