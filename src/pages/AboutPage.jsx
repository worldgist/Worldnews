import { Link } from 'react-router-dom'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { getCategoryPath } from '../admin/storage'
import { categories as defaultCategories } from '../data/feed'

function splitIntoParagraphs(text) {
  if (!text || !String(text).trim()) return []
  return String(text)
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export default function AboutPage() {
  const { settings, categories: adminCategories } = useSiteSettings()
  const categories = adminCategories && adminCategories.length ? adminCategories : defaultCategories.slice(0, 8)
  const paragraphs = splitIntoParagraphs(settings.aboutUsContent)

  return (
    <main className="container page-shell page-about">
      <header className="page-hero page-hero--about">
        <p className="page-kicker">About our newsroom</p>
        <h1 className="page-title">About {settings.siteName}</h1>
        <p className="page-lead">{settings.siteTagline}</p>
        <div className="page-hero-actions">
          <Link to="/contact-us" className="page-btn page-btn--primary">
            Contact the editors
          </Link>
          <Link to="/submit-news" className="page-btn page-btn--ghost">
            Submit a tip
          </Link>
        </div>
      </header>

      <section className="page-split" aria-labelledby="about-mission-heading">
        <div className="page-split-main">
          <h2 id="about-mission-heading" className="page-section-title">
            Our mission
          </h2>
          <div className="page-prose">
            {paragraphs.length ? (
              paragraphs.map((block, i) => <p key={`about-p-${i}`}>{block}</p>)
            ) : (
              <p>More about this publication will appear here soon.</p>
            )}
          </div>
          <ul className="page-checklist" role="list">
            <li>
              <strong>Clarity first</strong>
              <span>Headlines and explainers written for everyday readers.</span>
            </li>
            <li>
              <strong>Cross-topic context</strong>
              <span>National updates with global implications when it matters.</span>
            </li>
            <li>
              <strong>Consistent updates</strong>
              <span>Fresh stories with strong sourcing and editorial review.</span>
            </li>
          </ul>
        </div>
        <aside className="page-aside-card" aria-label="Quick links">
          <h3 className="page-aside-title">Navigate</h3>
          <ul className="page-aside-list">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/trending">Trending</Link>
            </li>
            <li>
              <Link to="/contact-us">Contact</Link>
            </li>
            <li>
              <Link to="/submit-news">Submit news</Link>
            </li>
            <li>
              <Link to="/advertise">Advertise</Link>
            </li>
            <li>
              <Link to="/terms-and-conditions">Terms</Link>
            </li>
          </ul>
        </aside>
      </section>

      <section className="page-band page-band--muted" aria-labelledby="coverage-heading">
        <div className="page-band-inner">
          <h2 id="coverage-heading" className="page-section-title">
            Coverage areas
          </h2>
          <p className="page-band-lead">
            Browse {settings.siteName} by desk. Topic tiles use the same structure as the main navigation.
          </p>
          <div className="page-topic-grid">
            {categories.map((name) => (
              <Link key={name} className="page-topic-tile" to={getCategoryPath(name)}>
                <span className="page-topic-name">{name}</span>
                <span className="page-topic-hint">Open category</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="page-cards-3" aria-labelledby="ethics-heading">
        <h2 id="ethics-heading" className="page-section-title page-section-title--center">
          Editorial standards
        </h2>
        <div className="page-card-grid">
          <article className="info-card">
            <h3 className="info-card-title">Accuracy and updates</h3>
            <p>
              We correct errors promptly and label significant updates when a story changes materially after publication.
            </p>
          </article>
          <article className="info-card">
            <h3 className="info-card-title">Corrections</h3>
            <p>
              If you spot a mistake, email <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a> with the
              article link and details.
            </p>
          </article>
          <article className="info-card">
            <h3 className="info-card-title">Independence</h3>
            <p>
              Sponsored content is disclosed clearly. Editorial coverage is separate from advertising unless explicitly
              labeled otherwise.
            </p>
          </article>
        </div>
      </section>
    </main>
  )
}
