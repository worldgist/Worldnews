import { loadCategories, loadPosts, loadSettings } from '../admin/storage'
import { mapCategoryRow } from './adminCategoriesApi'
import { supabase } from './supabaseClient'

function countPostsByStatus(posts) {
  const counts = { published: 0, scheduled: 0, draft: 0, other: 0 }
  const now = Date.now()

  for (const post of posts) {
    const status = post.status || 'published'
    if (status === 'published') {
      counts.published += 1
    } else if (status === 'scheduled') {
      const at = Date.parse(post.scheduledFor || '')
      if (Number.isFinite(at) && at <= now) {
        counts.published += 1
      } else {
        counts.scheduled += 1
      }
    } else if (status === 'draft') {
      counts.draft += 1
    } else {
      counts.other += 1
    }
  }

  return counts
}

function postsByCategory(posts) {
  const map = {}
  for (const post of posts) {
    const key = post.category?.trim() || 'Uncategorized'
    map[key] = (map[key] || 0) + 1
  }
  return Object.entries(map).sort((a, b) => b[1] - a[1])
}

function sortPostsRecent(posts) {
  return [...posts].sort((a, b) => {
    const ta = Date.parse(a.publishedAt || a.scheduledFor || '') || 0
    const tb = Date.parse(b.publishedAt || b.scheduledFor || '') || 0
    return tb - ta
  })
}

/** Build dashboard stats from local CMS cache + optional Supabase counts. */
export async function fetchAdminOverviewStats() {
  const settings = loadSettings()
  const localPosts = loadPosts()
  let posts = localPosts
  let categories = loadCategories()
  let activeCategories = categories.length

  let scheduledQueue = 0
  let overdueScheduled = 0
  let newsletterSubscribers = 0
  let formSubmissions = 0
  let commentThreads = 0
  let fromDatabase = false

  if (supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const [postsRes, catRes, queueRes] = await Promise.all([
      supabase.from('news_posts').select('id, title, category, status, featured, scheduled_for, published_at, updated_at'),
      supabase
        .from('cms_categories')
        .select('slug, name, description, route_path, sort_order, is_active, updated_at')
        .order('sort_order', { ascending: true }),
      supabase
        .from('scheduled_posts')
        .select('publish_at, queue_status')
        .eq('queue_status', 'pending'),
    ])

    if (!postsRes.error && postsRes.data?.length) {
      posts = postsRes.data.map((row) => ({
        id: row.id,
        title: row.title,
        category: row.category,
        status: row.status || 'published',
        featured: row.featured,
        scheduledFor: row.scheduled_for,
        publishedAt: row.published_at,
        updatedAt: row.updated_at,
      }))
      fromDatabase = true
    }

    if (!catRes.error && catRes.data?.length) {
      const catRows = catRes.data.map(mapCategoryRow).filter(Boolean)
      activeCategories = catRows.filter((c) => c.isActive).length
      categories = catRows.filter((c) => c.isActive).map((c) => c.name)
    }

    if (!queueRes.error && queueRes.data) {
      const now = Date.now()
      scheduledQueue = queueRes.data.length
      overdueScheduled = queueRes.data.filter((row) => {
        const at = Date.parse(row.publish_at || '')
        return Number.isFinite(at) && at <= now
      }).length
    }

    if (session) {
      const [newsRes, formsRes, commentsRes] = await Promise.all([
        supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
        supabase.from('public_form_submissions').select('id', { count: 'exact', head: true }),
        supabase.from('article_comments').select('id', { count: 'exact', head: true }),
      ])

      if (!newsRes.error) newsletterSubscribers = newsRes.count ?? 0
      if (!formsRes.error) formSubmissions = formsRes.count ?? 0
      if (!commentsRes.error) commentThreads = commentsRes.count ?? 0
    }
  }

  const statusCounts = countPostsByStatus(posts)
  const featuredCount = posts.filter((p) => p.featured).length
  const categoryBreakdown = postsByCategory(posts)
  const recentPosts = sortPostsRecent(posts).slice(0, 6)

  return {
    fromDatabase,
    siteName: settings.siteName?.trim() || 'World Gist News',
    siteTagline: settings.siteTagline?.trim() || '',
    contactEmail: settings.contactEmail?.trim() || '',
    totals: {
      posts: posts.length,
      published: statusCounts.published,
      scheduled: statusCounts.scheduled,
      draft: statusCounts.draft,
      featured: featuredCount,
      categories: activeCategories,
      scheduledQueue,
      overdueScheduled,
      newsletterSubscribers,
      formSubmissions,
      comments: commentThreads,
    },
    categoryBreakdown,
    recentPosts,
    categoryNames: categories,
  }
}
