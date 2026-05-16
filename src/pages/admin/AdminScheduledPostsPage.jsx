import { useEffect, useMemo, useState } from 'react'
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

function formatDateOnly(isoString) {
  if (!isoString) return 'N/A'
  const value = new Date(isoString)
  if (Number.isNaN(value.getTime())) return 'N/A'
  return value.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTimeOnly(isoString) {
  if (!isoString) return 'N/A'
  const value = new Date(isoString)
  if (Number.isNaN(value.getTime())) return 'N/A'
  return value.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function toLocalDateTimeInputValue(isoString) {
  const value = new Date(isoString)
  if (Number.isNaN(value.getTime())) return ''

  const offset = value.getTimezoneOffset()
  const local = new Date(value.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

function getScheduledPosts() {
  return loadPosts()
    .filter((post) => (post.status || 'published') === 'scheduled')
    .sort((a, b) => {
      const timeA = Date.parse(a.scheduledFor || '')
      const timeB = Date.parse(b.scheduledFor || '')
      return timeA - timeB
    })
}

export default function AdminScheduledPostsPage() {
  const [scheduledPosts, setScheduledPosts] = useState(getScheduledPosts)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedPostIds, setSelectedPostIds] = useState([])
  const [rescheduleDraft, setRescheduleDraft] = useState({})

  const refresh = () => {
    const posts = getScheduledPosts()
    setScheduledPosts(posts)
    setSelectedPostIds((prev) => prev.filter((id) => posts.some((post) => post.id === id)))
  }

  const categoryOptions = useMemo(() => {
    return [...new Set(scheduledPosts.map((post) => post.category).filter(Boolean))].sort()
  }, [scheduledPosts])

  const filteredPosts = useMemo(() => {
    const lowered = searchTerm.trim().toLowerCase()
    return scheduledPosts.filter((post) => {
      const inCategory = categoryFilter === 'all' || post.category === categoryFilter
      const inSearch =
        lowered.length === 0
          || post.title.toLowerCase().includes(lowered)
          || (post.author || '').toLowerCase().includes(lowered)
      return inCategory && inSearch
    })
  }, [scheduledPosts, searchTerm, categoryFilter])

  const queueStats = useMemo(() => {
    const now = Date.now()
    const overdue = scheduledPosts.filter((post) => {
      const scheduledTime = Date.parse(post.scheduledFor || '')
      return Number.isFinite(scheduledTime) && scheduledTime <= now
    }).length

    const nextPost = scheduledPosts.find((post) => Number.isFinite(Date.parse(post.scheduledFor || '')))

    return {
      total: scheduledPosts.length,
      filtered: filteredPosts.length,
      overdue,
      nextAt: nextPost?.scheduledFor || null,
    }
  }, [scheduledPosts, filteredPosts])

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

  const handlePublishSelected = () => {
    if (selectedPostIds.length === 0) return
    const publishDate = new Date()
    const selectedSet = new Set(selectedPostIds)

    const nextPosts = loadPosts().map((post) => {
      if (!selectedSet.has(post.id)) return post
      return {
        ...post,
        status: 'published',
        scheduledFor: null,
        publishedAt: publishDate.toISOString(),
        date: formatDateLabel(publishDate),
      }
    })

    savePosts(nextPosts)
    setSelectedPostIds([])
    refresh()
  }

  const handleDelete = (postId) => {
    const nextPosts = loadPosts().filter((post) => post.id !== postId)
    savePosts(nextPosts)
    refresh()
  }

  const handleDeleteSelected = () => {
    if (selectedPostIds.length === 0) return
    const selectedSet = new Set(selectedPostIds)
    const nextPosts = loadPosts().filter((post) => !selectedSet.has(post.id))
    savePosts(nextPosts)
    setSelectedPostIds([])
    refresh()
  }

  const handleSelectPost = (postId, checked) => {
    setSelectedPostIds((prev) => {
      if (checked) return [...new Set([...prev, postId])]
      return prev.filter((id) => id !== postId)
    })
  }

  const handleSelectAllVisible = (checked) => {
    if (!checked) {
      const visibleIds = new Set(filteredPosts.map((post) => post.id))
      setSelectedPostIds((prev) => prev.filter((id) => !visibleIds.has(id)))
      return
    }

    setSelectedPostIds((prev) => {
      const merged = new Set(prev)
      filteredPosts.forEach((post) => merged.add(post.id))
      return [...merged]
    })
  }

  const handleReschedule = (postId) => {
    const draftValue = rescheduleDraft[postId]
    if (!draftValue) return

    const nextDate = new Date(draftValue)
    if (Number.isNaN(nextDate.getTime()) || nextDate.getTime() <= Date.now()) {
      alert('Please choose a future date and time for rescheduling.')
      return
    }

    const nextPosts = loadPosts().map((post) => {
      if (post.id !== postId) return post
      return {
        ...post,
        status: 'scheduled',
        scheduledFor: nextDate.toISOString(),
        publishedAt: null,
      }
    })

    savePosts(nextPosts)
    setRescheduleDraft((prev) => ({ ...prev, [postId]: '' }))
    refresh()
  }

  const handlePublishDueNow = () => {
    const now = Date.now()
    const publishDate = new Date()
    let changed = false

    const nextPosts = loadPosts().map((post) => {
      if ((post.status || 'published') !== 'scheduled') return post
      const scheduledTime = Date.parse(post.scheduledFor || '')
      if (!Number.isFinite(scheduledTime) || scheduledTime > now) return post

      changed = true
      return {
        ...post,
        status: 'published',
        scheduledFor: null,
        publishedAt: publishDate.toISOString(),
        date: formatDateLabel(publishDate),
      }
    })

    if (!changed) {
      alert('No queued posts are due for publish yet.')
      return
    }

    savePosts(nextPosts)
    refresh()
  }

  const allVisibleSelected =
    filteredPosts.length > 0 && filteredPosts.every((post) => selectedPostIds.includes(post.id))

  return (
    <section className="admin-panel-card" aria-label="Scheduled post management">
      <div className="admin-post-list-head">
        <h2>Scheduled Post Management</h2>
        <div className="admin-post-item-actions">
          <button type="button" onClick={handlePublishDueNow}>Publish Due Now</button>
          <button type="button" onClick={refresh}>Refresh</button>
        </div>
      </div>

      <div className="scheduled-queue-stats">
        <article>
          <strong>{queueStats.total}</strong>
          <span>Queued Posts</span>
        </article>
        <article>
          <strong>{queueStats.filtered}</strong>
          <span>Visible in Filter</span>
        </article>
        <article>
          <strong>{queueStats.overdue}</strong>
          <span>Due/Overdue</span>
        </article>
        <article>
          <strong>{queueStats.nextAt ? formatDateTime(queueStats.nextAt) : 'N/A'}</strong>
          <span>Next Publish</span>
        </article>
      </div>

      <div className="scheduled-queue-controls">
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search title or author"
          aria-label="Search scheduled posts"
        />
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
          <option value="all">All categories</option>
          {categoryOptions.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="scheduled-queue-bulk-actions">
        <label>
          <input
            type="checkbox"
            checked={allVisibleSelected}
            onChange={(event) => handleSelectAllVisible(event.target.checked)}
          />
          Select all visible
        </label>
        <div className="admin-post-item-actions">
          <button type="button" onClick={handlePublishSelected} disabled={selectedPostIds.length === 0}>
            Publish Selected
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={handleDeleteSelected}
            disabled={selectedPostIds.length === 0}
          >
            Delete Selected
          </button>
        </div>
      </div>

      <div className="admin-post-list">
        <h4>Queued Posts ({scheduledPosts.length})</h4>
        {filteredPosts.length === 0 ? (
          <p>No scheduled posts in queue.</p>
        ) : (
          <ul>
            {filteredPosts.map((post) => (
              <li key={post.id}>
                <div>
                  <strong>
                    <label className="scheduled-post-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedPostIds.includes(post.id)}
                        onChange={(event) => handleSelectPost(post.id, event.target.checked)}
                      />
                      <span>{post.title}</span>
                    </label>
                  </strong>
                  <p>{post.category} | {post.author}</p>
                  <p>Schedule Date: {formatDateOnly(post.scheduledFor)} | Schedule Time: {formatTimeOnly(post.scheduledFor)}</p>
                  <div className="scheduled-post-reschedule">
                    <input
                      type="datetime-local"
                      value={rescheduleDraft[post.id] ?? toLocalDateTimeInputValue(post.scheduledFor)}
                      min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                      onChange={(event) => {
                        const value = event.target.value
                        setRescheduleDraft((prev) => ({ ...prev, [post.id]: value }))
                      }}
                    />
                    <button type="button" onClick={() => handleReschedule(post.id)}>
                      Reschedule
                    </button>
                  </div>
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
