import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import NewsCard from '../components/NewsCard'
import { getById, getLatest, mostRead, articles } from '../data/feed'
import { loadSettings } from '../admin/storage'

const NEWS_ARTICLE_JSONLD_ID = 'news-article-jsonld'

function commentsStorageKey(articleId) {
  return `worldnews-comments-${articleId}`
}

function loadComments(articleId) {
  try {
    const saved = localStorage.getItem(commentsStorageKey(articleId))
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export default function ArticlePage() {
  const { id } = useParams()
  const article = getById(id)
  const [comments, setComments] = useState([])
  const [commentName, setCommentName] = useState('')
  const [commentText, setCommentText] = useState('')
  const [replyOpenFor, setReplyOpenFor] = useState(null)
  const [replyName, setReplyName] = useState('')
  const [replyText, setReplyText] = useState('')
  const [subscribeEmail, setSubscribeEmail] = useState('')
  const [commentSettings, setCommentSettings] = useState(loadSettings())

  const articleUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/article/${id}`
  }, [id])

  useEffect(() => {
    if (typeof document === 'undefined') return undefined

    const existing = document.getElementById(NEWS_ARTICLE_JSONLD_ID)
    if (existing) existing.remove()

    if (!article) return undefined

    const parsedDate = new Date(article.date)
    const datePublished = Number.isNaN(parsedDate.getTime())
      ? article.date
      : parsedDate.toISOString().split('T')[0]

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.title,
      description: article.summary,
      image: [article.image],
      author: {
        '@type': 'Person',
        name: article.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'World Gist News',
        logo: {
          '@type': 'ImageObject',
          url: `${window.location.origin}/logo.png`,
        },
      },
      datePublished,
      mainEntityOfPage: articleUrl,
      articleSection: article.category,
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = NEWS_ARTICLE_JSONLD_ID
    script.text = JSON.stringify(jsonLd)
    document.head.appendChild(script)

    return () => {
      const current = document.getElementById(NEWS_ARTICLE_JSONLD_ID)
      if (current) current.remove()
    }
  }, [article, articleUrl])

  useEffect(() => {
    if (!id) return
    setComments(loadComments(id))
    setReplyOpenFor(null)
    setReplyName('')
    setReplyText('')
  }, [id])

  useEffect(() => {
    const syncSettings = () => setCommentSettings(loadSettings())
    window.addEventListener('storage', syncSettings)
    return () => window.removeEventListener('storage', syncSettings)
  }, [])

  const commentsEnabled = commentSettings.commentsEnabled !== false
  const repliesEnabled = commentSettings.repliesEnabled !== false
  const maxCommentLength = Math.min(2000, Math.max(80, Number(commentSettings.commentMaxLength) || 500))

  const persistComments = (nextComments) => {
    setComments(nextComments)
    if (!id) return
    localStorage.setItem(commentsStorageKey(id), JSON.stringify(nextComments))
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!commentsEnabled) return
    if (!commentName.trim() || !commentText.trim()) return
    if (commentText.trim().length > maxCommentLength) {
      alert(`Comment cannot exceed ${maxCommentLength} characters.`)
      return
    }

    const nextComments = [
      {
        id: crypto.randomUUID(),
        name: commentName.trim(),
        text: commentText.trim(),
        createdAt: new Date().toISOString(),
        replies: [],
      },
      ...comments,
    ]

    persistComments(nextComments)
    setCommentName('')
    setCommentText('')
  }

  const handleAddReply = (e, commentId) => {
    e.preventDefault()
    if (!repliesEnabled) return
    if (!replyName.trim() || !replyText.trim()) return
    if (replyText.trim().length > maxCommentLength) {
      alert(`Reply cannot exceed ${maxCommentLength} characters.`)
      return
    }

    const nextComments = comments.map((comment) => {
      if (comment.id !== commentId) return comment
      return {
        ...comment,
        replies: [
          ...(comment.replies || []),
          {
            id: crypto.randomUUID(),
            name: replyName.trim(),
            text: replyText.trim(),
            createdAt: new Date().toISOString(),
          },
        ],
      }
    })

    persistComments(nextComments)
    setReplyOpenFor(null)
    setReplyName('')
    setReplyText('')
  }

  const openInstallPrompt = () => {
    alert('To install this app: open your browser menu and choose "Install app".')
  }

  const handleArticleSubscribe = (e) => {
    e.preventDefault()
    const email = subscribeEmail.trim()
    if (!email) return
    alert(`Subscribed successfully with ${email}.`)
    setSubscribeEmail('')
  }

  if (!article) {
    return (
      <main className="container not-found">
        <p className="kicker">404</p>
        <h1>Story not found</h1>
        <Link className="read-more" to="/">
          Back to homepage
        </Link>
      </main>
    )
  }

  // Related: same category, different id, max 3
  const related = articles
    .filter((a) => a.category === article.category && a.id !== article.id)
    .slice(0, 3)

  const sameCategoryPosts = articles.filter(
    (a) => a.category === article.category && a.id !== article.id
  )

  const recentPosts = sameCategoryPosts.slice(0, 5)

  const latestPosts = getLatest(8)
    .filter((a) => a.category === article.category)
    .filter((a) => a.id !== article.id)
    .slice(0, 5)

  const popularPosts = mostRead
    .map((item) => getById(item.id))
    .filter(Boolean)
    .filter((a) => a.category === article.category)
    .filter((a) => a.id !== article.id)
    .slice(0, 5)

  const encodedUrl = encodeURIComponent(articleUrl)
  const encodedTitle = encodeURIComponent(article.title)
  const storyParagraphs =
    Array.isArray(article.body) && article.body.length > 0
      ? article.body
      : [article.summary]

  return (
    <main className="container story-layout">
      <article className="story-main">
        <p className="kicker">
          <Link to={`/category/${article.category.toLowerCase()}`}>
            {article.category}
          </Link>
        </p>
        <h1>{article.title}</h1>
        <p className="story-dek">{article.summary}</p>

        <div className="story-meta">
          <span>{article.author}</span>
          <span>{article.date}</span>
          <span>{article.readTime} read</span>
        </div>

        <img
          className="story-hero"
          src={article.image}
          alt={article.title}
        />

        <section className="story-full" aria-label="Full story content">
          <h2>Full Story</h2>
          {storyParagraphs.map((paragraph, idx) =>
            paragraph.startsWith('"') || paragraph.startsWith('\u201c') ? (
              <blockquote key={idx}>{paragraph}</blockquote>
            ) : (
              <p key={idx}>{paragraph}</p>
            )
          )}
        </section>

        <section className="story-facts" aria-label="Story details">
          <h3>Story Details</h3>
          <ul>
            <li>Category: {article.category}</li>
            <li>Author: {article.author}</li>
            <li>Published: {article.date}</li>
            <li>Estimated read time: {article.readTime}</li>
          </ul>
        </section>

        <section className="story-tools" aria-label="Share this article">
          <h3>Share this story</h3>
          <div className="share-row">
            <button type="button" className="share-btn install" onClick={openInstallPrompt}>
              Install
            </button>
            <a
              className="share-btn facebook"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank"
              rel="noreferrer"
            >
              Facebook
            </a>
            <a
              className="share-btn whatsapp"
              href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
            <a
              className="share-btn x"
              href={`https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
              target="_blank"
              rel="noreferrer"
            >
              X
            </a>
            <a
              className="share-btn instagram"
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              title="Open Instagram and paste this article link"
            >
              Instagram
            </a>
          </div>
        </section>

        <section className="article-subscribe" aria-label="Article subscribe">
          <h3>Like this article? Enter email to subscribe</h3>
          <form className="article-subscribe-form" onSubmit={handleArticleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email"
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
              required
            />
            <button type="submit">Subscribe</button>
          </form>
        </section>

        <section className="comments-section" aria-label="Comments and replies">
          <h3>Comments ({comments.length})</h3>

          {!commentsEnabled ? (
            <p className="comments-empty">Comments are currently disabled by admin settings.</p>
          ) : (
            <form className="comment-form" onSubmit={handleAddComment}>
              <input
                type="text"
                placeholder="Your name"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                required
              />
              <textarea
                placeholder="Write a comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={4}
                maxLength={maxCommentLength}
                required
              />
              <button type="submit">Post Comment</button>
            </form>
          )}

          <div className="comments-list">
            {comments.length === 0 && (
              <p className="comments-empty">No comments yet. Be the first to comment.</p>
            )}

            {comments.map((comment) => (
              <article key={comment.id} className={`comment-item${comment.isClosed ? ' closed' : ''}`}>
                <header>
                  <strong>{comment.name}</strong>
                  <span>{new Date(comment.createdAt).toLocaleString()}</span>
                </header>
                <p>{comment.text}</p>

                {comment.isClosed && (
                  <p className="comment-closed-note">Comment closed by admin.</p>
                )}

                {repliesEnabled && !comment.isClosed && (
                  <button
                    type="button"
                    className="reply-toggle"
                    onClick={() => {
                      setReplyOpenFor(replyOpenFor === comment.id ? null : comment.id)
                      setReplyName('')
                      setReplyText('')
                    }}
                  >
                    Reply
                  </button>
                )}

                {repliesEnabled && !comment.isClosed && replyOpenFor === comment.id && (
                  <form className="reply-form" onSubmit={(e) => handleAddReply(e, comment.id)}>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={replyName}
                      onChange={(e) => setReplyName(e.target.value)}
                      required
                    />
                    <textarea
                      placeholder="Write a reply"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                      maxLength={maxCommentLength}
                      required
                    />
                    <button type="submit">Post Reply</button>
                  </form>
                )}

                {(comment.replies || []).length > 0 && (
                  <div className="replies-list">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="reply-item">
                        <header>
                          <strong>{reply.name}</strong>
                          <span>{new Date(reply.createdAt).toLocaleString()}</span>
                        </header>
                        <p>{reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <Link className="read-more back-link" to="/">
          &larr; Back to homepage
        </Link>
      </article>

      <aside className="story-aside">
        <div className="aside-card">
          <h3>Recent Posts</h3>
          <ul className="post-links-list">
            {recentPosts.map((post) => (
              <li key={post.id}>
                <Link to={`/article/${post.id}`} target="_blank" rel="noopener noreferrer">
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="aside-card">
          <h3>Popular Posts</h3>
          <ul className="post-links-list">
            {popularPosts.map((post) => (
              <li key={post.id}>
                <Link to={`/article/${post.id}`} target="_blank" rel="noopener noreferrer">
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="aside-card">
          <h3>Latest Posts</h3>
          <ul className="post-links-list">
            {latestPosts.map((post) => (
              <li key={post.id}>
                <Link to={`/article/${post.id}`} target="_blank" rel="noopener noreferrer">
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {related.length > 0 && (
          <div className="aside-card">
            <h3>More in {article.category}</h3>
            <div className="related-list">
              {related.map((r) => (
                <NewsCard key={r.id} article={r} size="small" />
              ))}
            </div>
          </div>
        )}

        <div className="aside-card aside-newsletter">
          <p className="kicker">Newsletter</p>
          <h3>Morning Brief</h3>
          <p>Top stories delivered before 8AM.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              alert('Subscribed!')
            }}
          >
            <label htmlFor="asideEmail" className="sr-only">
              Email
            </label>
            <input
              id="asideEmail"
              type="email"
              placeholder="you@example.com"
              required
            />
            <button type="submit">Join</button>
          </form>
        </div>
      </aside>
    </main>
  )
}
