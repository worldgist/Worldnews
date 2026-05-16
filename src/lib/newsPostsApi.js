import { supabase } from './supabaseClient'
import { resolveArticleImage } from './articleImage'

/** Map DB row → editor / public article shape (localStorage + feed). */
export function mapNewsPostRow(row) {
  if (!row) return null

  let body = row.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = []
    }
  }
  if (!Array.isArray(body)) body = []

  const article = {
    id: row.id,
    title: row.title,
    category: row.category?.trim() || 'World',
    summary: row.summary || '',
    body,
    author: row.author || 'worldgistnews',
    date: row.display_date || '',
    readTime: row.read_time || '5 min',
    image: row.image_url || '',
    featured: Boolean(row.featured),
    htmlContent: row.body_html || '',
    status: row.status || 'published',
    scheduledFor: row.scheduled_for || null,
    publishedAt: row.published_at || null,
  }

  article.image = resolveArticleImage(article)
  return article
}

/** Map editor article → DB row. */
export function mapPostToNewsRow(post) {
  const status = post.status || 'published'
  return {
    id: post.id,
    title: post.title?.trim() || 'Untitled',
    category: post.category?.trim() || 'World',
    summary: post.summary?.trim() || '',
    body: Array.isArray(post.body) ? post.body : [],
    body_html: post.htmlContent || '',
    author: post.author?.trim() || 'worldgistnews',
    image_url: post.image?.trim() || null,
    read_time: post.readTime?.trim() || '5 min',
    display_date: post.date?.trim() || '',
    status,
    featured: Boolean(post.featured),
    scheduled_for: post.scheduledFor || null,
    published_at: post.publishedAt || null,
    updated_at: new Date().toISOString(),
  }
}

export async function fetchNewsPostsFromDatabase({ editorView = false } = {}) {
  if (!supabase) return { posts: [], fromDatabase: false }

  const query = supabase
    .from('news_posts')
    .select(
      'id, title, category, summary, body, body_html, author, image_url, read_time, display_date, status, featured, scheduled_for, published_at, updated_at',
    )
    .order('updated_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.warn('news_posts fetch:', error.message)
    return { posts: [], fromDatabase: false, error: error.message }
  }

  const posts = (data || []).map(mapNewsPostRow).filter(Boolean)
  return { posts, fromDatabase: posts.length > 0, editorView }
}

export async function upsertNewsPostsToDatabase(posts) {
  if (!supabase) return { ok: false, error: 'Supabase not configured' }

  const rows = posts.map((p) => mapPostToNewsRow(p))
  if (rows.length === 0) return { ok: true }

  const { error } = await supabase.from('news_posts').upsert(rows, { onConflict: 'id' })
  if (error) {
    console.warn('news_posts upsert:', error.message)
    return { ok: false, error: error.message }
  }
  return { ok: true }
}

export async function deleteNewsPostsFromDatabase(ids) {
  if (!supabase || !ids?.length) return { ok: true }
  const { error } = await supabase.from('news_posts').delete().in('id', ids)
  if (error) {
    console.warn('news_posts delete:', error.message)
    return { ok: false, error: error.message }
  }
  return { ok: true }
}
