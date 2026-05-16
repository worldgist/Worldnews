import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import NewsCard from '../components/NewsCard'
import PostPagination, { STORIES_PER_PAGE } from '../components/PostPagination'
import { getPublicByCategory } from '../data/publicFeed'
import { useFeedSync } from '../hooks/useFeedSync'

export default function SportsNewsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const feedSync = useFeedSync()
  const stories = useMemo(() => getPublicByCategory('Sports'), [feedSync])
  const totalPages = Math.max(1, Math.ceil(stories.length / STORIES_PER_PAGE))
  const start = (currentPage - 1) * STORIES_PER_PAGE
  const paginatedStories = stories.slice(start, start + STORIES_PER_PAGE)

  return (
    <main className="container">
      <div className="category-header">
        <p className="kicker">News</p>
        <h1>Sports News</h1>
        <p>{stories.length} stories</p>
      </div>

      {stories.length === 0 ? (
        <p className="empty-state">No sports stories available yet.</p>
      ) : (
        <>
          <div className="card-grid card-grid--wide">
            {paginatedStories.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>

          <PostPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            ariaLabel="Sports news pagination"
          />
        </>
      )}

      <p style={{ marginTop: '1rem' }}>
        <Link className="read-more" to="/">
          Back to homepage
        </Link>
      </p>
    </main>
  )
}
