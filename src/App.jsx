import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { getPublicArticleById } from './data/publicFeed'
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
import TrendingPage from './pages/TrendingPage'
import SearchResultsPage from './pages/SearchResultsPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminLayout from './components/AdminLayout'
import AdminOverviewPage from './pages/admin/AdminOverviewPage'
import AdminAddCategoryPage from './pages/admin/AdminAddCategoryPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminPostsPage from './pages/admin/AdminPostsPage'
import AdminScheduledPostsPage from './pages/admin/AdminScheduledPostsPage'
import AdminSocialMediaPage from './pages/admin/AdminSocialMediaPage'
import AdminProfilePage from './pages/admin/AdminProfilePage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AdminFormInboxPage from './pages/admin/AdminFormInboxPage'
import AdminNewsletterPage from './pages/admin/AdminNewsletterPage'
import { supabase } from './lib/supabaseClient'
import { PublicFeedProvider } from './context/PublicFeedContext'
import { pullCmsSnapshot, syncLocalCmsToCloud, CMS_SYNC_EVENT } from './lib/cmsSync'
import './App.css'

const ADMIN_AUTH_KEY = 'worldnews-admin-auth'
const SETTINGS_STORAGE_KEY = 'worldnews-admin-settings'
const DEFAULT_SITE_NAME = 'World Gist News'
const DEFAULT_SITE_TAGLINE =
  'Trusted updates across world, politics, sports, school, technology, and entertainment.'
const BASE_URL = 'https://worldnews.vercel.app'

function upsertMetaByName(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function upsertMetaByProperty(property, content) {
  let tag = document.querySelector(`meta[property="${property}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('property', property)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function upsertCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', url)
}

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

  /** Full URL changes are separate views; reset scroll so it never feels like an in-page section jump. */
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!supabase) return undefined
    void pullCmsSnapshot()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) localStorage.setItem(ADMIN_AUTH_KEY, 'true')
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        localStorage.setItem(ADMIN_AUTH_KEY, 'true')
        void syncLocalCmsToCloud()
      }
      if (event === 'SIGNED_OUT') localStorage.removeItem(ADMIN_AUTH_KEY)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const applySeo = () => {
      try {
        const saved = localStorage.getItem(SETTINGS_STORAGE_KEY)
        const parsed = saved ? JSON.parse(saved) : null
        const siteName = parsed?.siteName?.trim() || DEFAULT_SITE_NAME
        const siteTagline = parsed?.siteTagline?.trim() || DEFAULT_SITE_TAGLINE

        let pageTitle = `${siteName} - ${siteTagline}`
        let description = siteTagline

        if (location.pathname === '/') {
          pageTitle = `${siteName} - Breaking News, Politics, Sports, Technology & Entertainment`
          description =
            'Read latest headlines and in-depth updates on world news, politics, sports, school, technology, and entertainment.'
        } else if (location.pathname === '/trending') {
          pageTitle = `Trending - ${siteName}`
          description = 'See the stories readers are engaging with most across every news section.'
        } else if (location.pathname === '/world-news') {
          pageTitle = `World News - ${siteName}`
          description = 'Breaking world updates, diplomacy, economy, and global affairs coverage.'
        } else if (location.pathname === '/politics-news') {
          pageTitle = `Politics News - ${siteName}`
          description = 'Latest political stories, policy decisions, governance, and elections coverage.'
        } else if (location.pathname === '/sports-news') {
          pageTitle = `Sports News - ${siteName}`
          description = 'Top sports headlines, league updates, athlete stories, and match analysis.'
        } else if (location.pathname === '/school-news') {
          pageTitle = `School News - ${siteName}`
          description = 'Education and school updates, learning reforms, and campus developments.'
        } else if (location.pathname === '/technology-news') {
          pageTitle = `Technology News - ${siteName}`
          description = 'Technology trends, digital innovation, startups, and product breakthroughs.'
        } else if (location.pathname === '/entertainment-news') {
          pageTitle = `Entertainment News - ${siteName}`
          description = 'Entertainment updates on film, music, celebrity culture, and events.'
        } else if (location.pathname === '/about-us') {
          pageTitle = `About Us - ${siteName}`
          description = 'Learn about World Gist News mission, editorial focus, and newsroom values.'
        } else if (location.pathname === '/contact-us') {
          pageTitle = `Contact Us - ${siteName}`
          description = 'Contact the World Gist News editorial team for tips, partnerships, and inquiries.'
        } else if (location.pathname === '/advertise') {
          pageTitle = `Advertise - ${siteName}`
          description = 'Advertise with World Gist News and reach engaged readers across key news categories.'
        } else if (location.pathname === '/submit-news') {
          pageTitle = `Submit News - ${siteName}`
          description = 'Submit verified news tips, story leads, and press information to our newsroom.'
        } else if (location.pathname === '/terms-and-conditions') {
          pageTitle = `Terms and Conditions - ${siteName}`
          description = 'Read terms and conditions for using World Gist News website and services.'
        } else if (location.pathname.startsWith('/search')) {
          const query = new URLSearchParams(location.search).get('q')
          pageTitle = query ? `Search: ${query} - ${siteName}` : `Search - ${siteName}`
          description = query
            ? `Search results for ${query} on ${siteName}.`
            : `Search latest stories and topics on ${siteName}.`
        } else if (location.pathname.startsWith('/article/')) {
          const articleId = location.pathname.split('/article/')[1]
          const article = getPublicArticleById(articleId)

          if (article) {
            pageTitle = `${article.title} - ${siteName}`
            description = article.summary
          } else {
            pageTitle = `Article - ${siteName}`
            description = 'Read in-depth reporting and updates on World Gist News.'
          }
        } else if (location.pathname.startsWith('/category/')) {
          const slug = location.pathname.split('/category/')[1] || ''
          const categoryName = slug
            .split('-')
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ')
          pageTitle = `${categoryName || 'Category'} News - ${siteName}`
          description = `Latest ${categoryName || 'category'} updates and headlines on ${siteName}.`
        }

        const canonicalUrl = `${BASE_URL}${location.pathname}${location.search || ''}`
        document.title = pageTitle
        upsertMetaByName('description', description)
        upsertMetaByProperty('og:title', pageTitle)
        upsertMetaByProperty('og:description', description)
        upsertMetaByProperty('og:url', canonicalUrl)
        upsertMetaByName('twitter:title', pageTitle)
        upsertMetaByName('twitter:description', description)
        upsertCanonical(canonicalUrl)
      } catch {
        document.title = DEFAULT_SITE_NAME
        upsertMetaByName('description', DEFAULT_SITE_TAGLINE)
      }
    }

    applySeo()
    window.addEventListener('storage', applySeo)
    window.addEventListener('worldnews-admin-storage', applySeo)
    window.addEventListener(CMS_SYNC_EVENT, applySeo)
    return () => {
      window.removeEventListener('storage', applySeo)
      window.removeEventListener('worldnews-admin-storage', applySeo)
      window.removeEventListener(CMS_SYNC_EVENT, applySeo)
    }
  }, [location.pathname, location.search])

  return (
    <PublicFeedProvider>
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
        <Route path="/trending" element={<TrendingPage />} />
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
          <Route path="scheduled-posts" element={<AdminScheduledPostsPage />} />
          <Route path="social-media" element={<AdminSocialMediaPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="form-inbox" element={<AdminFormInboxPage />} />
          <Route path="newsletter" element={<AdminNewsletterPage />} />
        </Route>
        <Route path="/admin/dashboard" element={<Navigate to="/admin/overview" replace />} />
      </Routes>
      {!isAdminRoute && <SiteFooter />}
      <Analytics />
    </div>
    </PublicFeedProvider>
  )
}
