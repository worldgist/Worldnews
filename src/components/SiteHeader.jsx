import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { tickerItems, categories } from '../data/feed'

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

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

        <Link className="brand" to="/" aria-label="World Gist News home">
          <span className="brand-mark">WGN</span>
          <span className="brand-text">World Gist News</span>
        </Link>

        <form className="header-search-form" onSubmit={submitSearch} role="search" aria-label="Search news">
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
          className="search-btn icon-btn"
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
            x
          </button>

          <form className="main-nav-search" onSubmit={submitSearch} role="search" aria-label="Search news">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news..."
              aria-label="Search news"
            />
            <button type="submit">Search</button>
          </form>

          <NavLink to="/" end onClick={closeMenu}>
            Home
          </NavLink>
          {categories.map((cat) => (
            <NavLink
              key={cat}
              to={`/category/${cat.toLowerCase()}`}
              onClick={closeMenu}
            >
              {cat}
            </NavLink>
          ))}
          <NavLink to="/about-us" onClick={closeMenu}>
            About Us
          </NavLink>
          <NavLink to="/contact-us" onClick={closeMenu}>
            Contact Us
          </NavLink>
          <NavLink to="/terms-and-conditions" onClick={closeMenu}>
            Terms and Conditions
          </NavLink>
        </nav>
      </div>

      <div className="ticker" role="status" aria-live="polite">
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((line, index) => (
            <span key={`${line}-${index}`}>• {line}</span>
          ))}
        </div>
      </div>
    </header>
  )
}
