import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getPublicArticleById } from '../data/publicFeed'
import { mostRead } from '../data/feed'
import { useFeedSync } from '../hooks/useFeedSync'

/**
 * Homepage-style “Popular posts” band (uses global `mostRead` + article data).
 */
export default function PopularPostsBand({ limit = 5, articles: articleList }) {
  const feedSync = useFeedSync()
  const stories = useMemo(() => {
    const fromMostRead = mostRead
      .map((item) => getPublicArticleById(item.id, articleList))
      .filter(Boolean)
    if (fromMostRead.length >= limit) return fromMostRead.slice(0, limit)

    const pool = Array.isArray(articleList) && articleList.length > 0 ? articleList : []
    if (pool.length > 0) return pool.slice(0, limit)

    return fromMostRead
  }, [limit, feedSync, articleList])

  if (stories.length === 0) return null

  return (
    <section className="popular-zone" aria-label="Popular posts">
      <header className="popular-zone__header">
        <p className="popular-zone__kicker">Trending now</p>
        <h2 className="popular-zone__title">Popular posts</h2>
        <p className="popular-zone__lede">
          The stories readers are opening most across every section.
        </p>
      </header>

      <ul className="popular-list" role="list">
        {stories.map((story, index) => (
          <li key={story.id} className="popular-list__item">
            <Link
              className={`popular-card popular-item-link${
                index === 0 ? ' popular-card--lead' : ''
              }`}
              to={`/article/${story.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span
                className="popular-card__rank"
                aria-label={`${index + 1} of ${stories.length}`}
              >
                {index + 1}
              </span>
              <div className="popular-card__media">
                <img src={story.image} alt="" loading="lazy" />
              </div>
              <div className="popular-card__body">
                <span className="popular-card__category">{story.category}</span>
                <h3 className="popular-card__title">{story.title}</h3>
                <p className="popular-card__meta">
                  <span>{story.date}</span>
                  {story.readTime ? <span>{story.readTime}</span> : null}
                </p>
                <span className="popular-card__cta">Read article</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
