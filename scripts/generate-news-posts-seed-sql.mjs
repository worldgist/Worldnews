import { writeFileSync } from 'node:fs'
import { mapPostToNewsRow } from '../src/lib/newsPostsApi.js'
import { todayArticles } from '../src/data/todayArticles.js'

function sqlEscape(value) {
  return value.replace(/'/g, "''")
}

function sqlJson(value) {
  return `'${sqlEscape(JSON.stringify(value))}'::jsonb`
}

const statements = todayArticles.map((article) => {
  const row = mapPostToNewsRow(article)
  const id = sqlEscape(row.id)
  return `insert into public.news_posts (
  id, title, category, summary, body, body_html, author, image_url, read_time,
  display_date, status, featured, scheduled_for, published_at, updated_at
) values (
  '${id}',
  '${sqlEscape(row.title)}',
  '${sqlEscape(row.category)}',
  '${sqlEscape(row.summary)}',
  ${sqlJson(row.body)},
  '${sqlEscape(row.body_html)}',
  '${sqlEscape(row.author)}',
  ${row.image_url ? `'${sqlEscape(row.image_url)}'` : 'null'},
  '${sqlEscape(row.read_time)}',
  '${sqlEscape(row.display_date)}',
  '${sqlEscape(row.status)}',
  ${row.featured},
  ${row.scheduled_for ? `'${row.scheduled_for}'::timestamptz` : 'null'},
  ${row.published_at ? `'${row.published_at}'::timestamptz` : 'null'},
  now()
)
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  summary = excluded.summary,
  body = excluded.body,
  body_html = excluded.body_html,
  author = excluded.author,
  image_url = excluded.image_url,
  read_time = excluded.read_time,
  display_date = excluded.display_date,
  status = excluded.status,
  featured = excluded.featured,
  scheduled_for = excluded.scheduled_for,
  published_at = excluded.published_at,
  updated_at = now();`
})

const sql = `-- Seed structured news_posts for editor + public site
-- Regenerate: node scripts/generate-news-posts-seed-sql.mjs

${statements.join('\n\n')}
`

writeFileSync('supabase/migrations/20260516231000_seed_news_posts.sql', sql)
console.log(`Wrote ${todayArticles.length} rows to supabase/migrations/20260516231000_seed_news_posts.sql`)
