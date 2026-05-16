import { Link, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import NewsCard from '../components/NewsCard'
import { usePublicFeed } from '../hooks/usePublicFeed'

function useSearchQuery() {
  const { search } = useLocation()
  return new URLSearchParams(search).get('q')?.trim() || ''
}

export default function SearchResultsPage() {
  const query = useSearchQuery()
  const loweredQuery = query.toLowerCase()
  const { articles } = usePublicFeed()

  const results = query
    ? articles.filter((article) => {
      const haystack = [
        article.title,
        article.summary,
        article.category,
        article.author,
        ...(article.body || []),
        ...(article.htmlContent
          ? [article.htmlContent.replace(/<[^>]+>/g, ' ')]
          : []),
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(loweredQuery)
    })
    : []

  return (
    <main className="container search-page">
      <div className="category-header">
        <p className="kicker">Search</p>
        <h1>{query ? `Results for "${query}"` : 'Search News'}</h1>
        <p>{query ? `${results.length} matches found` : 'Type a keyword in the header search box.'}</p>
      </div>

      {!query && (
        <p className="empty-state">
          Try searching for topics like <strong>politics</strong>, <strong>sports</strong>,
          <strong> world</strong>, or <strong>technology</strong>.
        </p>
      )}

      {query && results.length === 0 && (
        <p className="empty-state">No news articles matched your search.</p>
      )}

      {results.length > 0 && (
        <div className="card-grid card-grid--wide">
          {results.map((article) => (
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
