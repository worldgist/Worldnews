/**
 * Public-facing article list: Supabase CMS (when available) plus static feed fallback.
 * Kept separate from feed.js to avoid import cycles (feed ← storage ← feed).
 */
import { articles, categories as feedCategories, mostRead } from './feed'
import { loadCategories, loadPosts } from '../admin/storage'

/** In-memory feed set after a direct Supabase fetch (landing page). */
let livePublicArticles = null

export function setLivePublicArticles(list) {
  livePublicArticles = Array.isArray(list) && list.length > 0 ? list : null
}

export function clearLivePublicArticles() {
  livePublicArticles = null
}

function isBrowser() {
  return typeof window !== 'undefined'
}

export function isCmsPostPubliclyVisible(post) {
  const s = post?.status || 'published'
  if (s === 'published') return true
  if (s === 'scheduled') {
    const t = Date.parse(post.scheduledFor || '')
    return Number.isFinite(t) && t <= Date.now()
  }
  return false
}

function cmsSortTime(post) {
  const t1 = Date.parse(post.publishedAt || '')
  if (Number.isFinite(t1)) return t1
  const t2 = Date.parse(post.scheduledFor || '')
  if (Number.isFinite(t2)) return t2
  return 0
}

export function getVisibleCmsArticles() {
  if (!isBrowser()) return []
  return loadPosts()
    .filter(isCmsPostPubliclyVisible)
    .sort((a, b) => cmsSortTime(b) - cmsSortTime(a))
}

/** Prefer DB snapshot, then local CMS cache, then static demo articles. */
export function mergePublicArticleLists(cmsFromDb = []) {
  const cms = (Array.isArray(cmsFromDb) ? cmsFromDb : [])
    .filter(isCmsPostPubliclyVisible)
    .sort((a, b) => cmsSortTime(b) - cmsSortTime(a))

  if (cms.length > 0) return cms

  const cached = getVisibleCmsArticles()
  if (cached.length > 0) return cached

  return [...articles]
}

function resolveArticles(override) {
  if (Array.isArray(override) && override.length > 0) return override
  if (livePublicArticles?.length) return livePublicArticles
  const merged = mergePublicArticleLists(getVisibleCmsArticles())
  return merged.length > 0 ? merged : [...articles]
}

/** Categories for navigation and /category/:slug (includes admin-added categories). */
export function getPublicCategories() {
  if (!isBrowser()) return feedCategories
  return loadCategories()
}

export function getAllArticles(articleList) {
  return resolveArticles(articleList)
}

export function getPublicArticleById(id, articleList) {
  if (!id) return null
  const all = resolveArticles(articleList)
  return all.find((a) => a.id === id) ?? staticArticles.find((a) => a.id === id) ?? null
}

export function getPublicByCategory(category, articleList) {
  return getAllArticles(articleList).filter(
    (a) => a.category.toLowerCase() === String(category).toLowerCase(),
  )
}

export function getPublicLatest(n = 6, articleList) {
  const merged = getAllArticles(articleList)
  const featured = getPublicFeatured(articleList)
  return merged
    .filter((a) => a.id !== featured?.id && !a.featured)
    .slice(0, n)
}

/** Lead story for the homepage hero (featured flag, else newest). */
export function getPublicFeatured(articleList) {
  const all = getAllArticles(articleList)
  const flagged = all.find((a) => a.featured)
  if (flagged) return flagged
  return all[0] ?? null
}

/** Scrolling header ticker lines from live headlines. */
export function getPublicTickerLines(limit = 8, articleList) {
  return getAllArticles(articleList)
    .slice(0, limit)
    .map((a) => `${a.category}: ${a.title}`)
}

/** Sidebar / “most read” list using real article records when available. */
export function getPublicHeadlineSidebar(limit = 5, excludeId = null, articleList) {
  const seen = new Set()
  const out = []

  for (const item of mostRead) {
    if (out.length >= limit) break
    const article = getPublicArticleById(item.id, articleList)
    if (!article || article.id === excludeId || seen.has(article.id)) continue
    seen.add(article.id)
    out.push(article)
  }

  for (const article of getAllArticles(articleList)) {
    if (out.length >= limit) break
    if (article.id === excludeId || seen.has(article.id)) continue
    seen.add(article.id)
    out.push(article)
  }

  return out
}
