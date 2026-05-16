import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import NewsCard from '../components/NewsCard'
import ArticleImage from '../components/ArticleImage'
import PopularPostsBand from '../components/PopularPostsBand'
import PostPagination, { STORIES_PER_PAGE } from '../components/PostPagination'
import { getCategoryPath } from '../admin/storage'
import { usePublicFeed } from '../hooks/usePublicFeed'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { subscribeNewsletter } from '../lib/newsletterSupabase'
import { supabase } from '../lib/supabaseClient'

function firstParagraph(text) {
  if (!text) return ''
  return (
    String(text)
      .split(/\n+/)
      .map((p) => p.trim())
      .find(Boolean) || ''
  )
}

function NewsletterForm({ tipsEmail, siteName }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('')
    const value = email.trim()
    if (!value) return

    if (supabase) {
      const result = await subscribeNewsletter(value, 'homepage')
      if (result.ok) {
        setStatus(
          result.duplicate
            ? 'You are already subscribed. Thank you!'
            : 'Subscribed successfully. Thank you!',
        )
        setEmail('')
        return
      }
      setStatus(result.error || 'Could not subscribe. Please try again.')
      return
    }

    if (tipsEmail) {
      const subject = encodeURIComponent(`${siteName} newsletter`)
      const body = encodeURIComponent(`Please add me to updates: ${value}`)
      window.location.href = `mailto:${tipsEmail}?subject=${subject}&body=${body}`
    } else {
      setStatus('Thanks — we will follow up soon.')
    }
    setEmail('')
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        required
        aria-label="Email for newsletter"
      />
      <button type="submit">Subscribe</button>
      {status ? <p className="newsletter-status">{status}</p> : null}
    </form>
  )
}

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [alertIndex, setAlertIndex] = useState(0)
  const { settings } = useSiteSettings()
  const {
    articles,
    loading,
    fromDatabase,
    featured,
    sidebarHeadlines,
    latestPosts,
    miniFeatures,
  } = usePublicFeed()

  const alertHeadlines = useMemo(() => {
    const lines = []
    if (featured?.title) lines.push(featured.title)
    for (const item of sidebarHeadlines) {
      if (item.title && !lines.includes(item.title)) lines.push(item.title)
    }
    return lines.length > 0 ? lines : ['Latest headlines loading…']
  }, [featured?.title, sidebarHeadlines])

  useEffect(() => {
    if (alertHeadlines.length <= 1) return undefined
    const timer = setInterval(() => {
      setAlertIndex((i) => (i + 1) % alertHeadlines.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [alertHeadlines.length])

  const gridStories = useMemo(() => {
    if (!featured?.id) return articles
    return articles.filter((a) => a.id !== featured.id)
  }, [articles, featured?.id])

  const totalPages = Math.max(1, Math.ceil(gridStories.length / STORIES_PER_PAGE))
  const start = (currentPage - 1) * STORIES_PER_PAGE
  const paginatedStories = gridStories.slice(start, start + STORIES_PER_PAGE)

  const aboutBlurb = firstParagraph(settings.aboutUsContent)
  const siteName = settings.siteName?.trim() || 'World Gist News'
  const siteTagline = settings.siteTagline?.trim() || ''
  const tipsEmail = settings.tipsEmail?.trim() || settings.contactEmail?.trim() || ''

  const cycleAlert = (delta) => {
    setAlertIndex((i) => (i + delta + alertHeadlines.length) % alertHeadlines.length)
  }

  return (
    <main className="container">
      {loading ? (
        <p className="landing-feed-status" role="status">
          Loading latest stories from the newsroom…
        </p>
      ) : fromDatabase ? (
        <p className="landing-feed-status landing-feed-status--live" role="status">
          Live from your published newsroom posts
        </p>
      ) : null}

      <div className="landing-alert" role="status" aria-live="polite">
        <p className="landing-alert__dot" aria-hidden="true">●</p>
        <p className="landing-alert__text">
          <strong>Breaking:</strong>{' '}
          {featured ? (
            <Link to={`/article/${featured.id}`}>{alertHeadlines[alertIndex]}</Link>
          ) : (
            alertHeadlines[alertIndex]
          )}
        </p>
        {alertHeadlines.length > 1 ? (
          <div className="landing-alert__controls">
            <button type="button" onClick={() => cycleAlert(-1)} aria-label="Previous headline">‹</button>
            <button type="button" onClick={() => cycleAlert(1)} aria-label="Next headline">›</button>
          </div>
        ) : null}
      </div>

      {featured ? (
        <section className="hero" aria-label="Featured story">
          <article className="hero-main">
            <Link to={`/article/${featured.id}`}>
              <ArticleImage article={featured} loading="eager" width={1400} />
            </Link>
            <div className="hero-content">
              <p className="kicker">
                <Link to={getCategoryPath(featured.category)}>{featured.category}</Link>
              </p>
              <h1>
                <Link to={`/article/${featured.id}`}>{featured.title}</Link>
              </h1>
              <p className="hero-meta">
                <span>{featured.author}</span>
                <span>{featured.date}</span>
                <span>{featured.readTime}</span>
              </p>
              <p>{featured.summary}</p>
            </div>
          </article>
          <aside className="hero-side" aria-label="Top headlines">
            <p className="kicker">Top headlines</p>
            <h2>Today on {siteName}</h2>
            <ol>
              {sidebarHeadlines.map((item) => (
                <li key={item.id}>
                  <Link to={`/article/${item.id}`}>{item.title}</Link>
                </li>
              ))}
            </ol>
          </aside>
        </section>
      ) : (
        <section className="hero hero--single" aria-label="Welcome">
          <article className="hero-main">
            <div className="hero-content">
              <p className="kicker">Welcome</p>
              <h1>{siteName}</h1>
              {siteTagline ? <p>{siteTagline}</p> : null}
            </div>
          </article>
        </section>
      )}

      {featured ? (
        <div className="readmore-strip">
          <span>Lead story</span>
          <Link to={`/article/${featured.id}`}>Read full report</Link>
        </div>
      ) : null}

      <section id="main-posts" className="news-section">
        <div className="section-head">
          <div>
            <h2>Main Posts</h2>
            {siteTagline ? <p className="section-lede">{siteTagline}</p> : null}
          </div>
          <Link to="/world-news">Browse all</Link>
        </div>
        {paginatedStories.length === 0 ? (
          <p className="empty-state">No stories published yet.</p>
        ) : (
          <div className="card-grid">
            {paginatedStories.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>

      <PostPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        ariaLabel="Main posts pagination"
      />

      <section className="news-section" id="latest-posts">
        <div className="section-head">
          <h2>Latest Posts</h2>
          <Link to="/trending">See trending</Link>
        </div>
        {latestPosts.length === 0 ? (
          <p className="empty-state">No recent posts yet.</p>
        ) : (
          <div className="card-grid">
            {latestPosts.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>

      {miniFeatures.length > 0 ? (
        <section className="three-col" aria-label="Editor's picks">
          {miniFeatures.map((article) => (
            <article key={article.id} className="mini-feature">
              <Link className="mini-feature-link" to={`/article/${article.id}`}>
                <p className="kicker">{article.category}</p>
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
                <span className="teaser-read-more">Read more</span>
              </Link>
            </article>
          ))}
        </section>
      ) : null}

      {aboutBlurb ? (
        <section className="editorial-band" aria-label="About our newsroom">
          <div>
            <p className="kicker">Our newsroom</p>
            <h2>{siteName}</h2>
            <p>{aboutBlurb}</p>
          </div>
          <Link className="read-more" to="/about-us">
            About {siteName}
          </Link>
        </section>
      ) : null}

      <section className="newsletter" aria-label="Newsletter signup">
        <div>
          <p className="kicker">Stay informed</p>
          <h2>Daily briefing from {siteName}</h2>
          <p>
            Get headlines and breaking updates. Tips and press releases:{' '}
            {tipsEmail ? (
              <a href={`mailto:${tipsEmail}`}>{tipsEmail}</a>
            ) : (
              <Link to="/contact-us">contact us</Link>
            )}
            .
          </p>
        </div>
        <NewsletterForm tipsEmail={tipsEmail} siteName={siteName} />
      </section>

      <PopularPostsBand limit={5} articles={articles} />
    </main>
  )
}
