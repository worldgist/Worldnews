import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CMS_SYNC_EVENT } from '../../lib/cmsEvents'
import { fetchAdminOverviewStats } from '../../lib/adminOverviewApi'
import { loadPublicFormLogMerged } from '../../utils/publicForms'

function formatWhen(iso) {
  if (!iso) return '—'
  const value = new Date(iso)
  if (Number.isNaN(value.getTime())) return '—'
  return value.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function statusLabel(post) {
  const status = post.status || 'published'
  if (status === 'scheduled') {
    const at = Date.parse(post.scheduledFor || '')
    if (Number.isFinite(at) && at <= Date.now()) return 'Due'
    return 'Scheduled'
  }
  if (status === 'draft') return 'Draft'
  return 'Published'
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null)
  const [recentForms, setRecentForms] = useState([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const refreshTimerRef = useRef(null)
  const mountedRef = useRef(true)

  const refresh = useCallback(async (options = {}) => {
    const { showInitialLoader = false } = options

    if (showInitialLoader) {
      setInitialLoading(true)
    } else {
      setRefreshing(true)
    }

    const [overview, forms] = await Promise.all([
      fetchAdminOverviewStats(),
      loadPublicFormLogMerged(),
    ])

    if (!mountedRef.current) return

    setStats(overview)
    setRecentForms(forms.slice(0, 5))
    setInitialLoading(false)
    setRefreshing(false)
  }, [])

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    refreshTimerRef.current = setTimeout(() => {
      refreshTimerRef.current = null
      void refresh({ showInitialLoader: false })
    }, 400)
  }, [refresh])

  useEffect(() => {
    mountedRef.current = true
    void refresh({ showInitialLoader: true })

    const onCmsSync = () => scheduleRefresh()

    window.addEventListener(CMS_SYNC_EVENT, onCmsSync)

    return () => {
      mountedRef.current = false
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
      window.removeEventListener(CMS_SYNC_EVENT, onCmsSync)
    }
  }, [refresh, scheduleRefresh])

  const maxCategoryCount = useMemo(() => {
    if (!stats?.categoryBreakdown?.length) return 1
    return Math.max(...stats.categoryBreakdown.map(([, count]) => count), 1)
  }, [stats])

  if (initialLoading || !stats) {
    return (
      <section className="admin-panel-card admin-analytics" aria-label="Dashboard overview">
        <p className="page-empty">Loading site overview…</p>
      </section>
    )
  }

  const { totals, siteName, siteTagline, contactEmail, fromDatabase } = stats

  return (
    <section className="admin-panel-card admin-analytics" aria-label="Dashboard overview">
      <div className="admin-overview-head">
        <div>
          <h2>{siteName} — Overview</h2>
          {siteTagline ? <p className="admin-overview-tagline">{siteTagline}</p> : null}
          <p className="admin-overview-meta">
            {fromDatabase ? 'Live counts from Supabase' : 'Counts from local editor cache'}
            {contactEmail ? ` · ${contactEmail}` : ''}
            {refreshing ? ' · Updating…' : ''}
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          disabled={refreshing}
          onClick={() => void refresh({ showInitialLoader: false })}
        >
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <h3 className="admin-overview-section-title">Content</h3>
      <div className="admin-metrics">
        <article>
          <h2>{totals.published}</h2>
          <p>Published stories</p>
        </article>
        <article>
          <h2>{totals.scheduled}</h2>
          <p>Scheduled posts</p>
        </article>
        <article>
          <h2>{totals.draft}</h2>
          <p>Drafts</p>
        </article>
        <article>
          <h2>{totals.posts}</h2>
          <p>Total in CMS</p>
        </article>
        <article>
          <h2>{totals.featured}</h2>
          <p>Featured stories</p>
        </article>
        <article>
          <h2>{totals.categories}</h2>
          <p>Active categories</p>
        </article>
      </div>

      <h3 className="admin-overview-section-title">Audience & inbox</h3>
      <div className="admin-metrics admin-metrics--secondary">
        <article>
          <h2>{totals.newsletterSubscribers}</h2>
          <p>Newsletter subscribers</p>
        </article>
        <article>
          <h2>{totals.formSubmissions}</h2>
          <p>Form submissions</p>
        </article>
        <article>
          <h2>{totals.comments}</h2>
          <p>Article comments</p>
        </article>
        <article>
          <h2>{totals.scheduledQueue}</h2>
          <p>Publish queue</p>
        </article>
        <article className={totals.overdueScheduled > 0 ? 'admin-metric--alert' : ''}>
          <h2>{totals.overdueScheduled}</h2>
          <p>Due / overdue</p>
        </article>
      </div>

      <div className="admin-analytics-grid">
        <article className="admin-analytics-card">
          <h3>Stories by category</h3>
          {stats.categoryBreakdown.length === 0 ? (
            <p className="post-media-empty">No posts yet.</p>
          ) : (
            <ul className="analytics-bars">
              {stats.categoryBreakdown.slice(0, 8).map(([name, count]) => (
                <li key={name}>
                  <span>{name}</span>
                  <div>
                    <i style={{ width: `${(count / maxCategoryCount) * 100}%` }} />
                  </div>
                  <strong>{count}</strong>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="admin-analytics-card">
          <h3>Quick actions</h3>
          <ul className="admin-overview-links">
            <li>
              <Link to="/admin/posts">News Post Editor</Link>
            </li>
            <li>
              <Link to="/admin/scheduled-posts">Scheduled Posts</Link>
            </li>
            <li>
              <Link to="/admin/add-category">Add Category</Link>
            </li>
            <li>
              <Link to="/admin/form-inbox">Form Inbox</Link>
            </li>
            <li>
              <Link to="/admin/newsletter">Newsletter</Link>
            </li>
            <li>
              <Link to="/">View live site</Link>
            </li>
          </ul>
        </article>

        <article className="admin-analytics-card analytics-span-2">
          <h3>Recent stories</h3>
          <ul className="analytics-list analytics-posts">
            {stats.recentPosts.length === 0 ? (
              <li>
                <span>No posts in the CMS yet.</span>
              </li>
            ) : (
              stats.recentPosts.map((post) => (
                <li key={post.id}>
                  <span>{post.title}</span>
                  <small>
                    {post.category} · {statusLabel(post)}
                    {post.scheduledFor ? ` · ${formatWhen(post.scheduledFor)}` : ''}
                    {post.publishedAt ? ` · ${formatWhen(post.publishedAt)}` : ''}
                  </small>
                </li>
              ))
            )}
          </ul>
        </article>

        {recentForms.length > 0 ? (
          <article className="admin-analytics-card analytics-span-2">
            <h3>Latest form submissions</h3>
            <ul className="analytics-list analytics-posts">
              {recentForms.map((entry) => (
                <li key={entry.id}>
                  <span>{entry.type}</span>
                  <small>{formatWhen(entry.at)}</small>
                </li>
              ))}
            </ul>
            <Link className="read-more" to="/admin/form-inbox">
              Open form inbox
            </Link>
          </article>
        ) : null}
      </div>
    </section>
  )
}
