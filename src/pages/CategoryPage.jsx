import { useParams, Link } from 'react-router-dom'
import NewsCard from '../components/NewsCard'
import { getByCategory, categories } from '../data/feed'

export default function CategoryPage() {
  const { slug } = useParams()

  // Match slug case-insensitively to canonical category names
  const canonicalCategory = categories.find(
    (c) => c.toLowerCase() === slug?.toLowerCase()
  )

  const stories = canonicalCategory ? getByCategory(canonicalCategory) : []

  if (!canonicalCategory) {
    return (
      <main className="container not-found">
        <p className="kicker">404</p>
        <h1>Category not found</h1>
        <Link className="read-more" to="/">
          Back to homepage
        </Link>
      </main>
    )
  }

  return (
    <main className="container">
      <div className="category-header">
        <p className="kicker">Section</p>
        <h1>{canonicalCategory}</h1>
        <p>{stories.length} stories</p>
      </div>

      {/* Category nav pills */}
      <div className="cat-pills">
        {categories.map((cat) => (
          <Link
            key={cat}
            to={`/category/${cat.toLowerCase()}`}
            className={`cat-pill${cat === canonicalCategory ? ' active' : ''}`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {stories.length === 0 ? (
        <p className="empty-state">No stories in this section yet.</p>
      ) : (
        <div className="card-grid card-grid--wide">
          {stories.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </main>
  )
}
