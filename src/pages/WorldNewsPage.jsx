import { Link } from 'react-router-dom'
import NewsCard from '../components/NewsCard'
import { getByCategory } from '../data/feed'

export default function WorldNewsPage() {
  const worldStories = getByCategory('World')

  return (
    <main className="container">
      <div className="category-header">
        <p className="kicker">News</p>
        <h1>World News</h1>
        <p>{worldStories.length} stories</p>
      </div>

      {worldStories.length === 0 ? (
        <p className="empty-state">No world news stories available yet.</p>
      ) : (
        <div className="card-grid card-grid--wide">
          {worldStories.map((article) => (
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
