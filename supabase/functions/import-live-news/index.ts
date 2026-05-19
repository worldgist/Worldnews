import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const NEWS_API_URL = 'https://api.thenewsapi.com/v1/news/top'

function toDisplayDate(value: string | null | undefined) {
  const ms = Date.parse(value || '')
  const date = Number.isFinite(ms) ? new Date(ms) : new Date()
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function estimateReadTime(text: string) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(3, Math.ceil(words / 200))
  return `${minutes} min`
}

function cleanSentence(text: string) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .trim()
}

function splitKeywords(keywords: unknown) {
  if (!keywords) return []
  if (Array.isArray(keywords)) return keywords.map((k) => cleanSentence(String(k))).filter(Boolean)
  return String(keywords)
    .split(',')
    .map((k) => cleanSentence(k))
    .filter(Boolean)
}

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildStoryParagraphs({
  title,
  description,
  snippet,
  source,
  category,
  locale,
  publishedAt,
  keywords,
}: {
  title: string
  description: string
  snippet: string
  source: string
  category: string
  locale: string
  publishedAt: string
  keywords: unknown
}) {
  const lines: string[] = []
  const cleanTitle = cleanSentence(title)
  const cleanDescription = cleanSentence(description)
  const cleanSnippet = cleanSentence(snippet)
  const keywordList = splitKeywords(keywords)

  lines.push(`${cleanTitle} is among the latest ${String(category || 'world').toLowerCase()} developments now shaping public conversation.`)

  if (cleanDescription) {
    lines.push(cleanDescription)
  }

  if (cleanSnippet && cleanSnippet !== cleanDescription) {
    lines.push(cleanSnippet)
  }

  if (keywordList.length > 0) {
    lines.push(`Key focus areas in this report include ${keywordList.slice(0, 6).join(', ')}.`)
  }

  lines.push(
    `This update was published on ${toDisplayDate(publishedAt)} and sourced from ${source || 'a verified newsroom'}${
      locale ? ` (${String(locale).toUpperCase()})` : ''
    }.`,
  )

  return lines.filter(Boolean)
}

function pickCategory(inputCategories: string[] | null | undefined) {
  const set = new Set((inputCategories || []).map((c) => String(c || '').toLowerCase()))
  if (set.has('politics') || set.has('general')) return 'Politics'
  if (set.has('sports')) return 'Sports'
  if (set.has('education')) return 'School'
  if (set.has('technology') || set.has('science') || set.has('business')) return 'Technology'
  if (set.has('entertainment')) return 'Entertainment'
  return 'World'
}

function stableHash(text: string) {
  let h = 0
  for (let i = 0; i < text.length; i += 1) {
    h = (h << 5) - h + text.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h).toString(36)
}

function makeRow(article: Record<string, unknown>) {
  const title = String(article?.title || '').trim()
  if (!title) return null

  const uuid = String(article?.uuid || '').trim()
  const url = String(article?.url || '').trim()
  const id = uuid ? `thenewsapi-${uuid}` : `thenewsapi-${stableHash(url || title)}`
  const description = String(article?.description || article?.snippet || '').trim()
  const snippet = String(article?.snippet || '').trim()
  const source = String(article?.source || 'TheNewsAPI').trim()
  const rawPublishedAt = String(article?.published_at || '')
  const publishedAtMs = Date.parse(rawPublishedAt)
  const publishedAt = Number.isFinite(publishedAtMs) ? new Date(publishedAtMs).toISOString() : new Date().toISOString()
  const category = pickCategory(article?.categories as string[] | undefined)
  const locale = String(article?.locale || '').trim()
  const summary = (description || snippet || title).slice(0, 2000)
  const storyParagraphs = buildStoryParagraphs({
    title,
    description,
    snippet,
    source,
    category,
    locale,
    publishedAt,
    keywords: article?.keywords,
  })
  const body = storyParagraphs.length > 0 ? storyParagraphs : [summary]
  const bodyHtml = body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n')

  return {
    id,
    title: title.slice(0, 500),
    category,
    summary,
    body,
    body_html: bodyHtml,
    author: source.slice(0, 200) || 'worldgistnews',
    image_url: (article?.image_url as string) || null,
    read_time: estimateReadTime(description || title),
    display_date: toDisplayDate(publishedAt),
    status: 'published',
    featured: false,
    scheduled_for: null,
    published_at: publishedAt,
    updated_at: new Date().toISOString(),
  }
}

function uniqueById(rows: Array<Record<string, unknown>>) {
  const map = new Map<string, Record<string, unknown>>()
  rows.forEach((row) => {
    if (!row?.id) return
    map.set(String(row.id), row)
  })
  return Array.from(map.values())
}

Deno.serve(async (req) => {
  try {
    const method = req.method.toUpperCase()
    if (method !== 'GET' && method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const cronSecret = Deno.env.get('LIVE_NEWS_CRON_SECRET')
    if (!cronSecret) {
      return new Response(JSON.stringify({ error: 'LIVE_NEWS_CRON_SECRET is not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const sentSecret = req.headers.get('x-cron-secret')
    if (sentSecret !== cronSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const apiToken = Deno.env.get('THENEWS_API_TOKEN')

    if (!supabaseUrl || !serviceRoleKey || !apiToken) {
      return new Response(
        JSON.stringify({ error: 'Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or THENEWS_API_TOKEN secret' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const url = new URL(req.url)
    const categories = url.searchParams.get('categories') || Deno.env.get('THENEWS_API_CATEGORIES') || ''
    const locale = url.searchParams.get('locale') || Deno.env.get('THENEWS_API_LOCALE') || ''
    const language = url.searchParams.get('language') || Deno.env.get('THENEWS_API_LANGUAGE') || 'en'
    const publishedOn = url.searchParams.get('publishedOn') || Deno.env.get('THENEWS_API_PUBLISHED_ON') || ''
    const publishedAfter = url.searchParams.get('publishedAfter') || Deno.env.get('THENEWS_API_PUBLISHED_AFTER') || ''
    const publishedBefore = url.searchParams.get('publishedBefore') || Deno.env.get('THENEWS_API_PUBLISHED_BEFORE') || ''
    const search = url.searchParams.get('search') || Deno.env.get('THENEWS_API_SEARCH') || ''
    const searchFields = url.searchParams.get('searchFields') || Deno.env.get('THENEWS_API_SEARCH_FIELDS') || ''
    const sort = url.searchParams.get('sort') || Deno.env.get('THENEWS_API_SORT') || 'published_at'
    const limitRaw = url.searchParams.get('limit') || Deno.env.get('THENEWS_API_LIMIT') || '25'
    const pageRaw = url.searchParams.get('page') || Deno.env.get('THENEWS_API_PAGE') || '1'

    const limit = Math.max(1, Math.min(100, Number(limitRaw) || 25))
    const page = Math.max(1, Number(pageRaw) || 1)

    const newsUrl = new URL(NEWS_API_URL)
    newsUrl.searchParams.set('api_token', apiToken)
    newsUrl.searchParams.set('language', language)
    newsUrl.searchParams.set('limit', String(limit))
    newsUrl.searchParams.set('page', String(page))
    newsUrl.searchParams.set('sort', sort)
    if (categories) newsUrl.searchParams.set('categories', categories)
    if (locale) newsUrl.searchParams.set('locale', locale)
    if (publishedOn) newsUrl.searchParams.set('published_on', publishedOn)
    if (publishedAfter) newsUrl.searchParams.set('published_after', publishedAfter)
    if (publishedBefore) newsUrl.searchParams.set('published_before', publishedBefore)
    if (search) newsUrl.searchParams.set('search', search)
    if (searchFields) newsUrl.searchParams.set('search_fields', searchFields)

    const newsRes = await fetch(newsUrl)
    if (!newsRes.ok) {
      const details = await newsRes.text()
      return new Response(JSON.stringify({ error: `TheNewsAPI error: ${details}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const payload = await newsRes.json()
    const allArticles = Array.isArray(payload?.data) ? payload.data : []

    const rows = uniqueById(allArticles.map(makeRow).filter(Boolean))
    if (rows.length === 0) {
      return new Response(JSON.stringify({ ok: true, imported: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { error } = await supabase.from('news_posts').upsert(rows, { onConflict: 'id' })
    if (error) {
      return new Response(JSON.stringify({ error: `Supabase upsert failed: ${error.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true, imported: rows.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
