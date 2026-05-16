import { supabase } from './supabaseClient'

/** @param {import('@supabase/supabase-js').PostgrestSingleResponse<any>} res */
function isOk(res) {
  return !res.error
}

/** @param {Record<string, any>[]} rows */
export function rowsToNestedComments(rows) {
  const childrenOf = new Map()
  for (const r of rows) {
    if (!r.parent_id) continue
    const list = childrenOf.get(r.parent_id) || []
    list.push(r)
    childrenOf.set(r.parent_id, list)
  }
  const roots = rows.filter((r) => !r.parent_id).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  return roots.map((top) => ({
    id: top.id,
    name: top.author_name,
    text: top.body,
    createdAt: top.created_at,
    isClosed: top.is_hidden,
    replies: (childrenOf.get(top.id) || [])
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((r) => ({
        id: r.id,
        name: r.author_name,
        text: r.body,
        createdAt: r.created_at,
      })),
  }))
}

export async function fetchCommentsForArticle(articleId) {
  if (!supabase) return null
  const res = await supabase
    .from('article_comments')
    .select('id, article_id, parent_id, author_name, body, created_at, is_hidden')
    .eq('article_id', articleId)
    .order('created_at', { ascending: true })
  if (!isOk(res) || !res.data) return null
  return rowsToNestedComments(res.data)
}

export async function insertTopLevelComment(articleId, authorName, body) {
  if (!supabase) return { ok: false }
  const res = await supabase.from('article_comments').insert({
    article_id: articleId,
    parent_id: null,
    author_name: authorName,
    body,
  })
  return { ok: isOk(res), error: res.error?.message }
}

export async function insertReply(articleId, parentId, authorName, body) {
  if (!supabase) return { ok: false }
  const res = await supabase.from('article_comments').insert({
    article_id: articleId,
    parent_id: parentId,
    author_name: authorName,
    body,
  })
  return { ok: isOk(res), error: res.error?.message }
}

export async function fetchAllCommentsGroupedByArticle() {
  if (!supabase) return null
  const res = await supabase
    .from('article_comments')
    .select('id, article_id, parent_id, author_name, body, created_at, is_hidden')
    .order('created_at', { ascending: true })
  if (!isOk(res) || !res.data) return null
  const byArticle = new Map()
  for (const row of res.data) {
    const list = byArticle.get(row.article_id) || []
    list.push(row)
    byArticle.set(row.article_id, list)
  }
  return byArticle
}

export async function deleteCommentsForArticle(articleId) {
  if (!supabase) return { ok: false }
  const res = await supabase.from('article_comments').delete().eq('article_id', articleId)
  return { ok: isOk(res), error: res.error?.message }
}

export async function deleteCommentById(commentId) {
  if (!supabase) return { ok: false }
  const res = await supabase.from('article_comments').delete().eq('id', commentId)
  return { ok: isOk(res), error: res.error?.message }
}

export async function setCommentHidden(commentId, isHidden) {
  if (!supabase) return { ok: false }
  const res = await supabase.from('article_comments').update({ is_hidden: isHidden }).eq('id', commentId)
  return { ok: isOk(res), error: res.error?.message }
}

export async function deleteAllComments() {
  if (!supabase) return { ok: false }
  const res = await supabase.from('article_comments').delete().gte('created_at', '1970-01-01T00:00:00Z')
  return { ok: isOk(res), error: res.error?.message }
}
