import { useMemo, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { useFeedSync } from '../hooks/useFeedSync'
import { getPublicTickerLines } from '../data/publicFeed'

export default function SiteHeader() {
  const { categories: navCategories, settings } = useSiteSettings()
  const feedSync = useFeedSync()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const siteName = settings.siteName?.trim() || 'World Gist News'
  const tickerLines = useMemo(() => {
    const lines = getPublicTickerLines(8)
    if (lines.length > 0) return lines
    const tagline = settings.siteTagline?.trim()
    return tagline ? [tagline] : [`${siteName} — latest headlines`]
  }, [feedSync, settings.siteTagline, siteName])
  const location = useLocation()
  const navigate = useNavigate()
  const isLandingPage = location.pathname === '/'

  const closeMenu = () => setMenuOpen(false)

  const submitSearch = (e) => {
    e.preventDefault()
    const query = searchQuery.trim()
    const searchPath = query ? `/search?q=${encodeURIComponent(query)}` : '/search'
    navigate(searchPath)
    closeMenu()
  }

  return (
    <header className="site-header">
      <button
        type="button"
        className={`menu-overlay${menuOpen ? ' open' : ''}`}
        aria-label="Close menu"
        onClick={closeMenu}
      />

      <div className="brand-row container">
        <button
          className="menu-toggle icon-btn"
          type="button"
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span aria-hidden="true">☰</span>
        </button>

        <Link className="brand" to="/" aria-label={`${siteName} home`}>
          <img className="brand-mark" src="/logo.png" alt={`${siteName} logo`} />
          <span className="brand-text">{siteName}</span>
        </Link>

        <form
          className={`header-search-form${isLandingPage ? ' landing-search' : ''}`}
          onSubmit={submitSearch}
          role="search"
          aria-label="Search news"
        >
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search news..."
            aria-label="Search news"
          />
          <button type="submit">Search</button>
        </form>

        <button
          className={`search-btn icon-btn${isLandingPage ? ' search-btn-hidden' : ''}`}
          type="button"
          aria-label="Go to search"
          onClick={() => navigate('/search')}
        >
          <span aria-hidden="true">⌕</span>
        </button>

        <nav
          className={`main-nav${menuOpen ? ' open' : ''}`}
          aria-label="Main navigation"
        >
          <button
            type="button"
            className="menu-close"
            aria-label="Close menu"
            onClick={closeMenu}
          >
            <span aria-hidden="true">&times;</span>
          </button>

          <form className="main-nav-search" onSubmit={submitSearch} role="search" aria-label="Search news">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, places…"
              aria-label="Search news"
            />
            <button type="submit">Search</button>
          </form>

          <div className="main-nav-drawer-head">
            <p className="main-nav-drawer-title">Sections</p>
            <p className="main-nav-drawer-sub">News categories &amp; tools</p>
          </div>

          <div className="main-nav-section main-nav-section--browse">
            <p className="main-nav-section-label" id="nav-browse-label">
              Browse
            </p>
            <button
              type="button"
              className="main-nav-dropdown-trigger"
              aria-haspopup="true"
              aria-controls="main-nav-panel-browse"
              id="nav-browse-trigger"
              tabIndex={0}
            >
              Browse
            </button>
            <div
              className="main-nav-section-links"
              id="main-nav-panel-browse"
              role="group"
              aria-label="Browse news and categories"
            >
              <NavLink
                to="/"
                end
                onClick={closeMenu}
                className={({ isActive }) =>
                  `main-nav-link main-nav-link--home${isActive ? ' active' : ''}`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/trending"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `main-nav-link main-nav-link--trending${isActive ? ' active' : ''}`
                }
              >
                Trending
              </NavLink>
              {navCategories.map((cat) => (
                <NavLink
                  key={cat}
                  to={`/category/${cat.toLowerCase()}`}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `main-nav-link${isActive ? ' active' : ''}`
                  }
                >
                  {cat}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="main-nav-section main-nav-section--site">
            <p className="main-nav-section-label" id="nav-site-label">
              Site
            </p>
            <button
              type="button"
              className="main-nav-dropdown-trigger"
              aria-haspopup="true"
              aria-controls="main-nav-panel-site"
              id="nav-site-trigger"
              tabIndex={0}
            >
              Site
            </button>
            <div
              className="main-nav-section-links"
              id="main-nav-panel-site"
              role="group"
              aria-label="Site information and policies"
            >
              <NavLink
                to="/about-us"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `main-nav-link${isActive ? ' active' : ''}`
                }
              >
                About Us
                <span className="sr-only"> (opens in new tab)</span>
              </NavLink>
              <NavLink
                to="/contact-us"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `main-nav-link${isActive ? ' active' : ''}`
                }
              >
                Contact Us
                <span className="sr-only"> (opens in new tab)</span>
              </NavLink>
              <NavLink
                to="/advertise"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `main-nav-link${isActive ? ' active' : ''}`
                }
              >
                Advertise
                <span className="sr-only"> (opens in new tab)</span>
              </NavLink>
              <NavLink
                to="/submit-news"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `main-nav-link${isActive ? ' active' : ''}`
                }
              >
                Submit News
                <span className="sr-only"> (opens in new tab)</span>
              </NavLink>
              <NavLink
                to="/terms-and-conditions"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `main-nav-link${isActive ? ' active' : ''}`
                }
              >
                Terms &amp; Conditions
                <span className="sr-only"> (opens in new tab)</span>
              </NavLink>
            </div>
          </div>
        </nav>
      </div>

      <div className="ticker" role="status" aria-live="polite">
        <div className="ticker-track">
          {[...tickerLines, ...tickerLines].map((line, index) => (
            <span key={`${line}-${index}`}>• {line}</span>
          ))}
        </div>
      </div>
    </header>
  )
}
