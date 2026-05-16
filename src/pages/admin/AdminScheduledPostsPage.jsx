import { useEffect, useState } from 'react'
import { loadPosts, savePosts } from '../../admin/storage'

function formatDateLabel(dateValue) {
  return dateValue.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(isoString) {
  if (!isoString) return 'N/A'
  const value = new Date(isoString)
  if (Number.isNaN(value.getTime())) return 'N/A'
  return value.toLocaleString()
}

export default function AdminScheduledPostsPage() {
  const [scheduledPosts, setScheduledPosts] = useState(
    loadPosts().filter((post) => (post.status || 'published') === 'scheduled'),
  )

  const refresh = () => {
    const posts = loadPosts().filter((post) => (post.status || 'published') === 'scheduled')
    setScheduledPosts(posts)
  }

  useEffect(() => {
    const sync = () => refresh()
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const handlePublishNow = (postId) => {
    const publishDate = new Date()
    const nextPosts = loadPosts().map((post) => {
      if (post.id !== postId) return post
      return {
        ...post,
        status: 'published',
        scheduledFor: null,
        publishedAt: publishDate.toISOString(),
        date: formatDateLabel(publishDate),
      }
    })

    savePosts(nextPosts)
    refresh()
  }

  const handleDelete = (postId) => {
    const nextPosts = loadPosts().filter((post) => post.id !== postId)
    savePosts(nextPosts)
    refresh()
  }

  return (
    <section className="admin-panel-card" aria-label="Scheduled post management">
      <div className="admin-post-list-head">
        <h2>Scheduled Post Management</h2>
        <button type="button" onClick={refresh}>Refresh</button>
      </div>

      <div className="admin-post-list">
        <h4>Queued Posts ({scheduledPosts.length})</h4>
        {scheduledPosts.length === 0 ? (
          <p>No scheduled posts in queue.</p>
        ) : (
          <ul>
            {scheduledPosts.map((post) => (
              <li key={post.id}>
                <div>
                  <strong>{post.title}</strong>
                  <p>{post.category} | {post.author} | Scheduled for: {formatDateTime(post.scheduledFor)}</p>
                </div>
                <div className="admin-post-item-actions">
                  <button type="button" onClick={() => handlePublishNow(post.id)}>
                    Publish Now
                  </button>
                  <button type="button" className="btn-danger" onClick={() => handleDelete(post.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
