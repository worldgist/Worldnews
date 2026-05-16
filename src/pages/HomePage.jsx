import { Link } from 'react-router-dom'
import NewsCard from '../components/NewsCard'
import { getFeatured, getByCategory, getById, mostRead } from '../data/feed'

const politicsStories = getByCategory('Politics').slice(0, 3)
const sportsStories = getByCategory('Sports').slice(0, 3)
const worldStories = getByCategory('World')
const schoolStories = getByCategory('School')
const techStories = getByCategory('Technology').slice(0, 1)

export default function HomePage() {
  const hero = getFeatured()
  const latest = worldStories.slice(0, 6)
  const landingPopular = mostRead
    .filter((item) => item.category === 'Politics')
    .slice(0, 3)

  const worldFeature = worldStories[0]
  const schoolFeature = schoolStories[0]
  const technologyFeature = techStories[0]

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
        <Link to="/category/politics">View all</Link>
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
          <Link to="/category/world">View all</Link>
        </div>
        <div className="card-grid">
          {latest.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      <section className="popular-zone" aria-label="Popular posts">
        <h2>LATEST POSTS</h2>
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

      {/* ── Politics / Sports split ───────────────────────────── */}
      <section className="split-section">
        <div id="politics" className="split-column">
          <div className="section-head">
            <h2>Politics</h2>
            <Link to="/category/politics">More</Link>
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
            <Link to="/category/sports">More</Link>
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
