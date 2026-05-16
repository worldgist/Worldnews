import { useState } from 'react'
import { Link } from 'react-router-dom'
import NewsCard from '../components/NewsCard'
import PopularPostsBand from '../components/PopularPostsBand'
import PostPagination, { STORIES_PER_PAGE } from '../components/PostPagination'
import { articles, getLatest } from '../data/feed'

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(1)

  const mainStories = articles
  const latestPosts = getLatest(9)
    .slice(0, 5)

  const totalPages = Math.max(1, Math.ceil(mainStories.length / STORIES_PER_PAGE))

  const start = (currentPage - 1) * STORIES_PER_PAGE
  const end = start + STORIES_PER_PAGE
  const paginatedStories = mainStories.slice(start, end)

  return (
    <main className="container">
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

      <PostPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        ariaLabel="Main posts pagination"
      />

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

      <PopularPostsBand limit={5} />
    </main>
  )
}
