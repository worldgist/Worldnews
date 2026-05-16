import { Link } from 'react-router-dom'

export default function AsidePostList({ posts, emptyMessage, showRank = false }) {
  if (!posts?.length) {
    return <p className="aside-post-list-empty">{emptyMessage}</p>
  }

  return (
    <ul
      className={`aside-post-list${showRank ? ' aside-post-list--ranked' : ''}`}
    >
      {posts.map((post, index) => (
        <li key={post.id}>
          <Link
            className="aside-post-teaser"
            to={`/article/${post.id}`}
            aria-label={`Read: ${post.title}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {showRank ? (
              <span className="aside-post-teaser__rank" aria-hidden="true">
                {index + 1}
              </span>
            ) : null}
            <img
              className="aside-post-teaser__thumb"
              src={post.image}
              alt=""
              loading="lazy"
            />
            <div className="aside-post-teaser__body">
              <span className="aside-post-teaser__title">{post.title}</span>
              <span className="aside-post-teaser__meta">
                <span className="aside-post-teaser__date">{post.date}</span>
                {post.readTime ? (
                  <>
                    <span className="aside-post-teaser__sep" aria-hidden="true">
                      {' '}
                      ·{' '}
                    </span>
                    <span>{post.readTime}</span>
                  </>
                ) : null}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
