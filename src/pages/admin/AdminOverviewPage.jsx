import { useEffect, useState } from 'react'
import { articles } from '../../data/feed'
import { loadCategories, loadPosts } from '../../admin/storage'

function toKpi(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return `${value}`
}

export default function AdminOverviewPage() {
  const [managedCategories, setManagedCategories] = useState(loadCategories())
  const [adminPosts, setAdminPosts] = useState(loadPosts())

  useEffect(() => {
    const sync = () => {
      setManagedCategories(loadCategories())
      setAdminPosts(loadPosts())
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const allPosts = [...adminPosts, ...articles]
  const featuredCount = allPosts.filter((story) => story.featured).length
  const totalPosts = allPosts.length
  const estimatedPageViews = totalPosts * 1260 + managedCategories.length * 290
  const uniqueVisitors = Math.round(estimatedPageViews * 0.38)
  const avgEngagement = Math.min(8.7, 2.2 + totalPosts * 0.04).toFixed(1)
  const bounceRate = Math.max(29, 61 - totalPosts * 0.15).toFixed(1)

  const categoryMap = allPosts.reduce((acc, post) => {
    const key = post.category || 'Uncategorized'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const trafficTrend = [
    { label: 'Mon', views: Math.round(estimatedPageViews * 0.11) },
    { label: 'Tue', views: Math.round(estimatedPageViews * 0.13) },
    { label: 'Wed', views: Math.round(estimatedPageViews * 0.14) },
    { label: 'Thu', views: Math.round(estimatedPageViews * 0.15) },
    { label: 'Fri', views: Math.round(estimatedPageViews * 0.17) },
    { label: 'Sat', views: Math.round(estimatedPageViews * 0.16) },
    { label: 'Sun', views: Math.round(estimatedPageViews * 0.14) },
  ]

  const maxViews = Math.max(...trafficTrend.map((d) => d.views), 1)

  const topPosts = allPosts.slice(0, 5).map((post) => {
    const score = (post.featured ? 1.4 : 1) * (post.summary?.length || 140)
    return {
      id: post.id,
      title: post.title,
      category: post.category,
      views: Math.round(score * 8 + 800),
    }
  })

  return (
    <section className="admin-panel-card admin-analytics" aria-label="Dashboard metrics">
      <h2>Website Analytics</h2>
      <div className="admin-metrics">
        <article>
          <h2>{toKpi(estimatedPageViews)}</h2>
          <p>Total Page Views</p>
        </article>
        <article>
          <h2>{toKpi(uniqueVisitors)}</h2>
          <p>Unique Visitors</p>
        </article>
        <article>
          <h2>{avgEngagement}m</h2>
          <p>Avg Engagement Time</p>
        </article>
        <article>
          <h2>{bounceRate}%</h2>
          <p>Bounce Rate</p>
        </article>
        <article>
          <h2>{managedCategories.length}</h2>
          <p>Active Categories</p>
        </article>
        <article>
          <h2>{featuredCount}</h2>
          <p>Featured Stories</p>
        </article>
      </div>

      <div className="admin-analytics-grid">
        <article className="admin-analytics-card">
          <h3>Weekly Traffic Trend</h3>
          <ul className="analytics-bars">
            {trafficTrend.map((day) => (
              <li key={day.label}>
                <span>{day.label}</span>
                <div>
                  <i style={{ width: `${(day.views / maxViews) * 100}%` }} />
                </div>
                <strong>{toKpi(day.views)}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="admin-analytics-card">
          <h3>Top Categories</h3>
          <ul className="analytics-list">
            {topCategories.map(([name, count]) => (
              <li key={name}>
                <span>{name}</span>
                <strong>{count} posts</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="admin-analytics-card analytics-span-2">
          <h3>Top Performing Posts</h3>
          <ul className="analytics-list analytics-posts">
            {topPosts.map((post) => (
              <li key={post.id}>
                <span>{post.title}</span>
                <small>{post.category}</small>
                <strong>{toKpi(post.views)} views</strong>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  )
}
