import { useState } from 'react'
import { Link } from 'react-router-dom'
import NewsCard from '../components/NewsCard'
import { articles, getFeatured, getByCategory, getById, getLatest, mostRead } from '../data/feed'

const worldStories = getByCategory('World')

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const storiesPerPage = 10

  const hero = getFeatured()
  const mainStories = articles.filter((story) => story.id !== hero.id)
  const latestPosts = getLatest(9)
    .filter((story) => story.id !== hero.id)
    .slice(0, 5)
  const landingPopular = mostRead
    .map((item) => getById(item.id))
    .filter(Boolean)
    .slice(0, 5)

  const totalPages = Math.max(1, Math.ceil(mainStories.length / storiesPerPage))

  const start = (currentPage - 1) * storiesPerPage
  const end = start + storiesPerPage
  const paginatedStories = mainStories.slice(start, end)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

  const goNext = () => {
    if (!hasNextPage) return
    setCurrentPage((page) => page + 1)
  }

  const goPrevious = () => {
    if (!hasPreviousPage) return
    setCurrentPage((page) => page - 1)
  }

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

      <section id="main-posts" className="news-section">
        <div className="section-head">
          <h2>Main Posts</h2>
          <Link to="/world-news">Browse all</Link>
        </div>
        <div className="card-grid">
          {paginatedStories.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      <div className="home-pagination-inline" aria-label="Homepage pagination">
        <button type="button" onClick={goPrevious} disabled={!hasPreviousPage}>
          Previous
        </button>
        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className={pageNumber === currentPage ? 'active' : ''}
            onClick={() => setCurrentPage(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
        <button type="button" onClick={goNext} disabled={!hasNextPage}>
          Next
        </button>
      </div>

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

      <section className="popular-zone" aria-label="Popular posts">
        <h2>POPULAR POSTS</h2>

        <div className="popular-list">
          {landingPopular.map((story) => (
            <Link
              key={story.id}
                className="popular-item popular-item-link"
                to={`/article/${story.id}`}
                target="_blank"
                rel="noopener noreferrer"
            >
              <img src={story.image || hero.image} alt={story.title} loading="lazy" />
              <div>
                <h3>{story.title}</h3>
                <p>{story.date}</p>
                <span className="teaser-read-more">Read more</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
