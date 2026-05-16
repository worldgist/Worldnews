import { Link } from 'react-router-dom'

export default function NewsCard({ article, size = 'normal' }) {
  return (
    <article className={`news-card news-card--${size}`}>
      <Link
        className="news-card-main-link"
        to={`/article/${article.id}`}
        aria-label={`Read full story: ${article.title}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={article.image} alt={article.title} loading="lazy" />
        <div className="card-body">
          <p className="kicker">{article.category}</p>
          <h3>{article.title}</h3>
          <p className="card-summary">{article.summary}</p>
          {article.author && (
            <span className="card-meta">
              {article.author} &middot; {article.date}
            </span>
          )}
          <span className="teaser-read-more">Read more</span>
        </div>
      </Link>
    </article>
  )
}
