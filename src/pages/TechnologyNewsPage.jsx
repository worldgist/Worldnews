import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import NewsCard from '../components/NewsCard'
import PostPagination, { STORIES_PER_PAGE } from '../components/PostPagination'
import { getPublicByCategory } from '../data/publicFeed'
import { usePublicFeed } from '../hooks/usePublicFeed'

export default function TechnologyNewsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const { articles } = usePublicFeed()
  const stories = useMemo(() => getPublicByCategory('Technology', articles), [articles])
  const totalPages = Math.max(1, Math.ceil(stories.length / STORIES_PER_PAGE))
  const start = (currentPage - 1) * STORIES_PER_PAGE
  const paginatedStories = stories.slice(start, start + STORIES_PER_PAGE)

  return (
    <main className="container">
      <div className="category-header">
        <p className="kicker">News</p>
        <h1>Technology News</h1>
        <p>{stories.length} stories</p>
      </div>

      {stories.length === 0 ? (
        <p className="empty-state">No technology stories available yet.</p>
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
            ariaLabel="Technology news pagination"
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
