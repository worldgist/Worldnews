import { Routes, Route } from 'react-router-dom'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import ArticlePage from './pages/ArticlePage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import TermsPage from './pages/TermsPage'
import './App.css'

export default function App() {
  return (
    <div className="app-shell">
      <div className="page-bg" />
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/article/:id" element={<ArticlePage />} />
        <Route path="/about-us" element={<AboutPage />} />
        <Route path="/contact-us" element={<ContactPage />} />
        <Route path="/terms-and-conditions" element={<TermsPage />} />
      </Routes>
      <SiteFooter />
    </div>
  )
}
