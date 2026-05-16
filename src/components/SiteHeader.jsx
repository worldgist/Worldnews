import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { tickerItems, categories } from '../data/feed'

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

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

        <button className="search-btn icon-btn" type="button" aria-label="Search">
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
