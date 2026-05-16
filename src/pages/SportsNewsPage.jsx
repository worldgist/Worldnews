import { Link } from 'react-router-dom'
import NewsCard from '../components/NewsCard'
import { getByCategory } from '../data/feed'

export default function SportsNewsPage() {
  const stories = getByCategory('Sports')

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
        <div className="card-grid card-grid--wide">
          {stories.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}

      <p style={{ marginTop: '1rem' }}>
        <Link className="read-more" to="/">
          Back to homepage
        </Link>
      </p>
    </main>
  )
}
