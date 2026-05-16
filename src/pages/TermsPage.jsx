import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../hooks/useSiteSettings'

export default function TermsPage() {
  const { settings } = useSiteSettings()
  const [search, setSearch] = useState('')
  const [printMode, setPrintMode] = useState(false)

  const sections = useMemo(() => {
    return String(settings.termsContent || '')
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((text, index) => ({
        id: `terms-${index + 1}`,
        index: index + 1,
        text,
      }))
  }, [settings.termsContent])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return sections
    return sections.filter((s) => s.text.toLowerCase().includes(q))
  }, [sections, search])

  function handlePrint() {
    setPrintMode(true)
    window.requestAnimationFrame(() => {
      window.print()
    })
  }

  useEffect(() => {
    const onAfterPrint = () => setPrintMode(false)
    window.addEventListener('afterprint', onAfterPrint)
    return () => window.removeEventListener('afterprint', onAfterPrint)
  }, [])

  return (
    <main className={`container page-shell page-terms${printMode ? ' page-terms--print' : ''}`}>
      <header className="page-hero page-hero--legal">
        <p className="page-kicker">Legal</p>
        <h1 className="page-title">Terms and conditions</h1>
        <p className="page-lead">
          These terms explain how you may use {settings.siteName}. Administrators can edit the underlying text from the
          settings panel; the page below reflects the live copy in your build.
        </p>
        <div className="page-hero-actions">
          <button type="button" className="page-btn page-btn--primary" onClick={handlePrint}>
            Print / save PDF
          </button>
          <Link to="/contact-us" className="page-btn page-btn--ghost">
            Questions? Contact us
          </Link>
        </div>
      </header>

      <div className="page-terms-toolbar" role="region" aria-label="Terms tools">
        <label className="page-search">
          <span className="sr-only">Search within terms</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search terms…"
            autoComplete="off"
          />
        </label>
        {search.trim() ? (
          <p className="page-terms-meta">
            Showing {filtered.length} of {sections.length} sections
          </p>
        ) : (
          <p className="page-terms-meta">
            Last viewed in this session — for effective date, set in your editorial policy or site notice.
          </p>
        )}
      </div>

      <div className="page-terms-layout">
        <nav className="page-toc" aria-label="Table of contents">
          <h2 className="page-toc-title">On this page</h2>
          <ol>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>
                  Section {s.index}
                </a>
              </li>
            ))}
          </ol>
          <p className="page-toc-note">
            Jump links work on desktop and mobile. Printing uses simplified styles for archival copies.
          </p>
        </nav>

        <article className="page-terms-body" aria-label="Terms text">
          {filtered.length === 0 ? (
            <p className="page-empty">No sections match your search. Clear the filter to see everything.</p>
          ) : (
            filtered.map((s) => (
              <section key={s.id} id={s.id} className="terms-section">
                <h2 className="terms-section-title">Section {s.index}</h2>
                <p>{s.text}</p>
              </section>
            ))
          )}
        </article>
      </div>

      <footer className="page-terms-footer">
        <p>
          For privacy-related questions, route through <Link to="/contact-us">Contact</Link>. Advertising relationships are
          governed by insertion orders in addition to these general terms.
        </p>
      </footer>
    </main>
  )
}
