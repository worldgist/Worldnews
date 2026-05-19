import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const NEWS_API_URL = 'https://api.thenewsapi.com/v1/news/top'

function loadEnvFile(path) {
  try {
    const raw = readFileSync(path, 'utf8')
    raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .forEach((line) => {
        const idx = line.indexOf('=')
        const key = line.slice(0, idx).trim()
        const value = line.slice(idx + 1).trim().replace(/^['\"]|['\"]$/g, '')
        if (!process.env[key]) process.env[key] = value
      })
  } catch {
    // Ignore missing env files.
  }
}

function parseArgs(argv) {
  const out = {}
  argv.forEach((arg) => {
    if (!arg.startsWith('--')) return
    const eq = arg.indexOf('=')
    if (eq === -1) {
      out[arg.slice(2)] = 'true'
      return
    }
    out[arg.slice(2, eq)] = arg.slice(eq + 1)
  })
  return out
}

function toDisplayDate(value) {
  const ms = Date.parse(value || '')
  const date = Number.isFinite(ms) ? new Date(ms) : new Date()
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function estimateReadTime(text) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(3, Math.ceil(words / 200))
  return `${minutes} min`
}

function pickCategory(inputCategories) {
  const set = new Set((inputCategories || []).map((c) => String(c || '').toLowerCase()))
  if (set.has('politics') || set.has('general')) return 'Politics'
  if (set.has('sports')) return 'Sports'
  if (set.has('education')) return 'School'
  if (set.has('technology') || set.has('science') || set.has('business')) return 'Technology'
  if (set.has('entertainment')) return 'Entertainment'
  return 'World'
}

function uniqueSentences(parts) {
  const seen = new Set()
  const out = []
  parts
    .map((p) => String(p || '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .forEach((line) => {
      const key = line.toLowerCase()
      if (seen.has(key)) return
      seen.add(key)
      out.push(line)
    })
  return out
}

function buildStoryParagraphs(article, category) {
  const title = String(article?.title || '').trim()
  const description = String(article?.description || '').trim()
  const snippet = String(article?.snippet || '').trim()
  const source = String(article?.source || 'TheNewsAPI').trim()
  const publishedAt = String(article?.published_at || '').trim()
  const locale = String(article?.locale || '').trim()
  const language = String(article?.language || '').trim()
  const keywords = Array.isArray(article?.keywords)
    ? article.keywords.map((k) => String(k || '').trim()).filter(Boolean)
    : String(article?.keywords || '')
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)

  const lead = uniqueSentences([description, snippet, title])[0] || title
  const evidence = uniqueSentences([snippet, description]).slice(0, 2).join(' ')
  const context = keywords.length
    ? `Key themes include ${keywords.slice(0, 8).join(', ')}.`
    : 'This development is being tracked as part of our ongoing live coverage.'
  const sourceMeta = [
    `Source outlet: ${source}.`,
    locale ? `Locale: ${locale}.` : '',
    language ? `Language: ${language}.` : '',
    publishedAt ? `Published: ${publishedAt}.` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return [
    lead,
    evidence || lead,
    `World Gist News live desk categorised this update under ${category} for editorial tracking and homepage distribution.`,
    context,
    `${sourceMeta} This article is presented in full on World Gist News so readers can stay on-platform.`,
  ]
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function makeRow(article) {
  const title = String(article?.title || '').trim()
  if (!title) return null

  const uuid = String(article?.uuid || '').trim()
  const articleUrl = String(article?.url || '').trim()
  const id = uuid
    ? `thenewsapi-${uuid}`
    : `thenewsapi-${Buffer.from(articleUrl || title).toString('base64url').slice(0, 48)}`

  const description = String(article?.description || article?.snippet || '').trim()
  const snippet = String(article?.snippet || '').trim()
  const source = String(article?.source || 'TheNewsAPI').trim()
  const publishedAt = article?.published_at || new Date().toISOString()
  const category = pickCategory(article?.categories)
  const summary = (description || snippet || title).slice(0, 2000)
  const body = buildStoryParagraphs(article, category)
  const bodyHtml = body.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n')

  return {
    id,
    title: title.slice(0, 500),
    category,
    summary,
    body,
    body_html: bodyHtml,
    author: source.slice(0, 200) || 'worldgistnews',
    image_url: article?.image_url || null,
    read_time: estimateReadTime(description || title),
    display_date: toDisplayDate(publishedAt),
    status: 'published',
    featured: false,
    scheduled_for: null,
    published_at: new Date(publishedAt).toISOString(),
    updated_at: new Date().toISOString(),
  }
}

function uniqueById(rows) {
  const map = new Map()
  rows.forEach((row) => {
    if (row?.id) map.set(row.id, row)
  })
  return Array.from(map.values())
}

async function run() {
  loadEnvFile('.env')
  loadEnvFile('.env.local')

  const args = parseArgs(process.argv.slice(2))
  const apiToken = process.env.THENEWS_API_TOKEN || process.env.NEWS_API_TOKEN || args.apiToken
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!apiToken) {
    throw new Error('Missing THENEWS_API_TOKEN (or NEWS_API_TOKEN). Add it to .env/.env.local.')
  }
  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL (or VITE_SUPABASE_URL).')
  }
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY. This script writes to DB and cannot use anon key.')
  }

  const categories = args.categories || process.env.THENEWS_API_CATEGORIES || ''
  const locale = args.locale || process.env.THENEWS_API_LOCALE || ''
  const language = args.language || process.env.THENEWS_API_LANGUAGE || 'en'
  const publishedOn = args.publishedOn || process.env.THENEWS_API_PUBLISHED_ON || ''
  const publishedAfter = args.publishedAfter || process.env.THENEWS_API_PUBLISHED_AFTER || ''
  const publishedBefore = args.publishedBefore || process.env.THENEWS_API_PUBLISHED_BEFORE || ''
  const search = args.search || process.env.THENEWS_API_SEARCH || ''
  const searchFields = args.searchFields || process.env.THENEWS_API_SEARCH_FIELDS || ''
  const sort = args.sort || process.env.THENEWS_API_SORT || 'published_at'
  const limit = Math.max(1, Math.min(100, Number(args.limit || process.env.THENEWS_API_LIMIT || 25)))
  const page = Math.max(1, Number(args.page || process.env.THENEWS_API_PAGE || 1))

  const url = new URL(NEWS_API_URL)
  url.searchParams.set('api_token', apiToken)
  url.searchParams.set('language', language)
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('page', String(page))
  url.searchParams.set('sort', sort)
  if (categories) url.searchParams.set('categories', categories)
  if (locale) url.searchParams.set('locale', locale)
  if (publishedOn) url.searchParams.set('published_on', publishedOn)
  if (publishedAfter) url.searchParams.set('published_after', publishedAfter)
  if (publishedBefore) url.searchParams.set('published_before', publishedBefore)
  if (search) url.searchParams.set('search', search)
  if (searchFields) url.searchParams.set('search_fields', searchFields)

  const response = await fetch(url)
  if (!response.ok) {
    const details = await response.text()
    throw new Error(`TheNewsAPI error (${response.status}): ${details}`)
  }

  const payload = await response.json()
  const allArticles = Array.isArray(payload?.data) ? payload.data : []

  const rows = uniqueById(allArticles.map(makeRow).filter(Boolean))
  if (rows.length === 0) {
    console.log('No articles returned by TheNewsAPI. Nothing inserted.')
    return
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { error } = await supabase.from('news_posts').upsert(rows, { onConflict: 'id' })
  if (error) {
    throw new Error(`Supabase upsert error: ${error.message}`)
  }

  console.log(`Imported ${rows.length} article(s) into news_posts.`)
}

run().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
