import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import ArticlePage from './pages/ArticlePage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import TermsPage from './pages/TermsPage'
import WorldNewsPage from './pages/WorldNewsPage'
import PoliticsNewsPage from './pages/PoliticsNewsPage'
import SportsNewsPage from './pages/SportsNewsPage'
import SchoolNewsPage from './pages/SchoolNewsPage'
import TechnologyNewsPage from './pages/TechnologyNewsPage'
import SearchResultsPage from './pages/SearchResultsPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import './App.css'

const ADMIN_AUTH_KEY = 'worldnews-admin-auth'

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
  return (
    <div className="app-shell">
      <div className="page-bg" />
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/article/:id" element={<ArticlePage />} />
        <Route path="/world-news" element={<WorldNewsPage />} />
        <Route path="/politics-news" element={<PoliticsNewsPage />} />
        <Route path="/sports-news" element={<SportsNewsPage />} />
        <Route path="/school-news" element={<SchoolNewsPage />} />
        <Route path="/technology-news" element={<TechnologyNewsPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/about-us" element={<AboutPage />} />
        <Route path="/contact-us" element={<ContactPage />} />
        <Route path="/terms-and-conditions" element={<TermsPage />} />
        <Route
          path="/admin/login"
          element={
            isAdminAuthenticated() ? <Navigate to="/admin/dashboard" replace /> : <AdminLoginPage />
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <RequireAdmin>
              <AdminDashboardPage />
            </RequireAdmin>
          }
        />
      </Routes>
      <SiteFooter />
    </div>
  )
}
