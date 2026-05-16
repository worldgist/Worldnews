import { supabase } from './supabaseClient'
import { mapNewsPostRow } from './newsPostsApi'

function formatDateLabel(dateValue) {
  return dateValue.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Merge queue row + joined news_posts into editor article shape. */
export function mapScheduledQueueRow(row) {
  const post = row.news_posts ? mapNewsPostRow(row.news_posts) : null
  if (!post) return null

  return {
    ...post,
    status: 'scheduled',
    scheduledFor: row.publish_at,
    scheduledQueueId: row.id,
    scheduledQueueStatus: row.queue_status,
    editorNotes: row.editor_notes || '',
    publishedAt: null,
  }
}

export async function fetchScheduledQueueFromDatabase() {
  if (!supabase) return { posts: [], fromDatabase: false }

  const { data, error } = await supabase
    .from('scheduled_posts')
    .select(
      `
      id,
      post_id,
      publish_at,
      queue_status,
      editor_notes,
      published_at,
      created_at,
      updated_at,
      news_posts (
        id, title, category, summary, body, body_html, author, image_url, read_time,
        display_date, status, featured, scheduled_for, published_at, updated_at
      )
    `,
    )
    .eq('queue_status', 'pending')
    .order('publish_at', { ascending: true })

  if (error) {
    console.warn('scheduled_posts fetch:', error.message)
    return { posts: [], fromDatabase: false, error: error.message }
  }

  const posts = (data || []).map(mapScheduledQueueRow).filter(Boolean)
  return { posts, fromDatabase: true }
}

export async function upsertScheduledQueueRow({ postId, publishAt, editorNotes = '' }) {
  if (!supabase) return { ok: false, error: 'Supabase not configured' }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const publishIso = new Date(publishAt).toISOString()
  const row = {
    post_id: postId,
    publish_at: publishIso,
    queue_status: 'pending',
    editor_notes: editorNotes?.trim() || '',
    ...(session?.user?.id ? { created_by: session.user.id } : {}),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('scheduled_posts').upsert(row, { onConflict: 'post_id' })
  if (error) {
    console.warn('scheduled_posts upsert:', error.message)
    return { ok: false, error: error.message }
  }

  await supabase
    .from('news_posts')
    .update({
      status: 'scheduled',
      scheduled_for: publishIso,
      published_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)

  return { ok: true }
}

export async function deleteScheduledQueueRows(postIds) {
  if (!supabase || !postIds?.length) return { ok: true }

  const { error } = await supabase.from('scheduled_posts').delete().in('post_id', postIds)
  if (error) {
    console.warn('scheduled_posts delete:', error.message)
    return { ok: false, error: error.message }
  }
  return { ok: true }
}

export async function markScheduledQueuePublished(postIds, publishDate = new Date()) {
  if (!supabase || !postIds?.length) return { ok: true }

  const publishIso = publishDate.toISOString()
  const displayDate = formatDateLabel(publishDate)

  const { error: queueErr } = await supabase
    .from('scheduled_posts')
    .update({
      queue_status: 'published',
      published_at: publishIso,
      updated_at: new Date().toISOString(),
    })
    .in('post_id', postIds)

  if (queueErr) {
    console.warn('scheduled_posts publish update:', queueErr.message)
    return { ok: false, error: queueErr.message }
  }

  const { error: postErr } = await supabase
    .from('news_posts')
    .update({
      status: 'published',
      scheduled_for: null,
      published_at: publishIso,
      display_date: displayDate,
      updated_at: new Date().toISOString(),
    })
    .in('id', postIds)

  if (postErr) {
    console.warn('news_posts publish update:', postErr.message)
    return { ok: false, error: postErr.message }
  }

  return { ok: true }
}

/** Keep scheduled_posts in sync after local editor saves posts array. */
export async function syncScheduledQueueFromPosts(posts) {
  if (!supabase) return { ok: false }

  const scheduled = posts.filter(
    (p) => (p.status || 'published') === 'scheduled' && p.scheduledFor,
  )
  const scheduledIds = new Set(scheduled.map((p) => p.id))

  for (const post of scheduled) {
    const result = await upsertScheduledQueueRow({
      postId: post.id,
      publishAt: post.scheduledFor,
    })
    if (!result.ok) return result
  }

  const { data: existing, error } = await supabase.from('scheduled_posts').select('post_id')
  if (error) {
    console.warn('scheduled_posts list:', error.message)
    return { ok: false, error: error.message }
  }

  const toRemove = (existing || [])
    .map((r) => r.post_id)
    .filter((id) => !scheduledIds.has(id))

  if (toRemove.length) {
    await deleteScheduledQueueRows(toRemove)
  }

  return { ok: true }
}
