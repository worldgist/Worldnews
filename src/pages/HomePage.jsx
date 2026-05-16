import { useState } from 'react'
import { Link } from 'react-router-dom'
import NewsCard from '../components/NewsCard'
import { getFeatured, getByCategory, getById, getLatest, mostRead } from '../data/feed'

const politicsStories = getByCategory('Politics').slice(0, 3)
const sportsStories = getByCategory('Sports').slice(0, 3)
const worldStories = getByCategory('World')
const schoolStories = getByCategory('School')
const techStories = getByCategory('Technology').slice(0, 4)

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const storiesPerPage = 10

  const hero = getFeatured()
  const latest = worldStories.slice(0, 6)
  const latestPosts = getLatest(9)
    .filter((story) => story.id !== hero.id)
    .slice(0, 6)
  const landingPopular = mostRead
    .filter((item) => item.category === 'Politics')
    .slice(0, 3)

  const worldFeature = worldStories[0]
  const schoolFeature = schoolStories[0]
  const technologyFeature = techStories[0]

  const allTopStories = [
    ...worldStories,
    ...politicsStories,
    ...sportsStories,
    ...schoolStories,
    ...techStories,
  ]
    .filter(Boolean)
    .filter((story) => story.id !== hero.id)
    .filter((story, index, all) => index === all.findIndex((item) => item.id === story.id))

  const start = (currentPage - 1) * storiesPerPage
  const end = start + storiesPerPage
  const moreStories = allTopStories.slice(start, end)
  const hasNextPage = end < allTopStories.length
  const hasPreviousPage = currentPage > 1

  const goNext = () => {
    if (!hasNextPage) return
    setCurrentPage((page) => page + 1)
  }

  const goPrevious = () => {
    if (!hasPreviousPage) return
    setCurrentPage((page) => page - 1)
  }

  const schoolUpdates = schoolStories.slice(0, 3)
  const technologyUpdates = techStories.slice(0, 3)

  return (
    <main className="container">
      <section className="landing-alert">
        <p className="landing-alert__dot" aria-hidden="true">•</p>
        <p className="landing-alert__text">Ceasefire Monitors Expand Mission After Coastal Standoff Cools</p>
        <div className="landing-alert__controls" aria-hidden="true">
          <span>&lt;</span>
          <span>&gt;</span>
        </div>
      </section>

      <section className="readmore-strip">
        <span>READ MORE</span>
        <Link to="/politics-news">View all</Link>
      </section>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="hero hero--single" aria-label="Top story">
        <article className="hero-main">
          <Link to={`/article/${hero.id}`} target="_blank" rel="noopener noreferrer">
            <img src={hero.image} alt={hero.title} />
          </Link>
          <div className="hero-content">
            <p className="kicker">
              <Link to={`/category/${hero.category.toLowerCase()}`}>
                {hero.category}
              </Link>
            </p>
            <h1>
              <Link to={`/article/${hero.id}`} target="_blank" rel="noopener noreferrer">
                {hero.title}
              </Link>
            </h1>
            <p className="hero-meta">
              by <span>{hero.author?.toLowerCase()}</span> - {hero.date}
            </p>
            <p>{hero.summary}</p>
            <Link className="read-more" to={`/article/${hero.id}`} target="_blank" rel="noopener noreferrer">
              Continue reading
            </Link>
          </div>
        </article>
      </section>

      {/* ── Latest Dispatches ─────────────────────────────────── */}
      <section id="latest" className="news-section">
        <div className="section-head">
          <h2>Latest Dispatches</h2>
          <Link to="/world-news">View all</Link>
        </div>
        <div className="card-grid">
          {latest.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      <section className="news-section" id="more-stories">
        <div className="section-head">
          <h2>More Top Stories</h2>
          <Link to="/world-news">See all sections</Link>
        </div>
        <div className="card-grid">
          {moreStories.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}

          {hasNextPage && (
            <button type="button" className="news-next-tile" onClick={goNext}>
              <span>Next</span>
              <small>Show more stories</small>
            </button>
          )}
        </div>
      </section>

      {hasPreviousPage && (
        <div className="home-pagination-inline">
          <button type="button" onClick={goPrevious}>
            Back to Previous
          </button>
        </div>
      )}

      <section className="news-section" id="latest-posts">
        <div className="section-head">
          <h2>Latest Posts</h2>
          <Link to="/world-news">Browse all</Link>
        </div>
        <div className="card-grid">
          {latestPosts.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {/* ── Politics / Sports split ───────────────────────────── */}
      <section className="split-section">
        <div id="politics" className="split-column">
          <div className="section-head">
            <h2>Politics</h2>
            <Link to="/politics-news">More</Link>
          </div>
          {politicsStories.map((story) => (
            <Link className="list-card list-card-link" key={story.id} to={`/article/${story.id}`} target="_blank" rel="noopener noreferrer">
              <h3>{story.title}</h3>
              <p>{story.summary}</p>
              <span className="teaser-read-more">Read more</span>
            </Link>
          ))}
        </div>

        <div id="sports" className="split-column">
          <div className="section-head">
            <h2>Sports</h2>
            <Link to="/sports-news">More</Link>
          </div>
          {sportsStories.map((story) => (
            <Link className="list-card list-card-link" key={story.id} to={`/article/${story.id}`} target="_blank" rel="noopener noreferrer">
              <h3>{story.title}</h3>
              <p>{story.summary}</p>
              <span className="teaser-read-more">Read more</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="split-section">
        <div id="school-updates" className="split-column">
          <div className="section-head">
            <h2>School Updates</h2>
            <Link to="/school-news">More</Link>
          </div>
          {schoolUpdates.map((story) => (
            <Link className="list-card list-card-link" key={story.id} to={`/article/${story.id}`} target="_blank" rel="noopener noreferrer">
              <h3>{story.title}</h3>
              <p>{story.summary}</p>
              <span className="teaser-read-more">Read more</span>
            </Link>
          ))}
        </div>

        <div id="technology-updates" className="split-column">
          <div className="section-head">
            <h2>Technology Updates</h2>
            <Link to="/technology-news">More</Link>
          </div>
          {technologyUpdates.map((story) => (
            <Link className="list-card list-card-link" key={story.id} to={`/article/${story.id}`} target="_blank" rel="noopener noreferrer">
              <h3>{story.title}</h3>
              <p>{story.summary}</p>
              <span className="teaser-read-more">Read more</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Editorial band ────────────────────────────────────── */}
      <section className="editorial-band" id="opinion">
        <div>
          <p className="kicker">Editor&apos;s Note</p>
          <h2>Why This Election Year Could Redraw Global Trade Routes</h2>
          <p>
            When domestic politics harden, ports, pipelines, and payment systems
            usually follow. Three strategic battlegrounds deserve close attention
            before markets react.
          </p>
        </div>
        <Link className="read-more" to="/article/election-clips" target="_blank" rel="noopener noreferrer">
          Read analysis
        </Link>
      </section>

      {/* ── Three column features ─────────────────────────────── */}
      <section className="three-col" id="world-focus">
        {worldFeature ? (
          <Link className="mini-feature mini-feature-link" to={`/article/${worldFeature.id}`} target="_blank" rel="noopener noreferrer">
            <p className="kicker">World</p>
            <h3>{worldFeature.title}</h3>
            <p>{worldFeature.summary}</p>
            <span className="teaser-read-more">Read more</span>
          </Link>
        ) : (
          <article className="mini-feature">
            <p className="kicker">World</p>
            <p>No world stories yet.</p>
          </article>
        )}

        {schoolFeature ? (
          <Link
            className="mini-feature mini-feature-link"
            id="school"
            to={`/article/${schoolFeature.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <p className="kicker">School</p>
            <h3>{schoolFeature.title}</h3>
            <p>{schoolFeature.summary}</p>
            <span className="teaser-read-more">Read more</span>
          </Link>
        ) : (
          <article className="mini-feature" id="school">
            <p className="kicker">School</p>
            <p>No school stories yet.</p>
          </article>
        )}

        {technologyFeature ? (
          <Link
            className="mini-feature mini-feature-link"
            id="technology-focus"
            to={`/article/${technologyFeature.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <p className="kicker">Technology</p>
            <h3>{technologyFeature.title}</h3>
            <p>{technologyFeature.summary}</p>
            <span className="teaser-read-more">Read more</span>
          </Link>
        ) : (
          <article className="mini-feature" id="technology-focus">
            <p className="kicker">Technology</p>
            <p>No technology stories yet.</p>
          </article>
        )}
      </section>

      <section className="popular-zone" aria-label="Popular posts">
        <h2>POPULAR POSTS</h2>

        <div className="popular-list">
          {landingPopular.map((item) => {
            const story = getById(item.id)

            return (
              <Link
                key={item.id}
                className="popular-item popular-item-link"
                to={`/article/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={story?.image || hero.image} alt={item.title} loading="lazy" />
                <div>
                  <h3>{item.title}</h3>
                  <p>{story?.date}</p>
                  <span className="teaser-read-more">Read more</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── Newsletter ────────────────────────────────────────── */}
      <section className="newsletter" id="newsletter">
        <div>
          <p className="kicker">Morning Brief</p>
          <h2>Get top global headlines before 8AM</h2>
          <p>Join readers getting concise updates and expert context delivered daily.</p>
        </div>
        <form
          className="newsletter-form"
          onSubmit={(e) => {
            e.preventDefault()
            alert('Thanks for subscribing!')
          }}
        >
          <label htmlFor="emailInput" className="sr-only">
            Email address
          </label>
          <input
            id="emailInput"
            type="email"
            placeholder="you@example.com"
            required
          />
          <button type="submit">Join Now</button>
        </form>
      </section>
    </main>
  )
}
