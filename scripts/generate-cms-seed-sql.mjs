import { writeFileSync } from 'node:fs'
import { todayArticles } from '../src/data/todayArticles.js'

function sqlEscape(value) {
  return value.replace(/'/g, "''")
}

const statements = todayArticles.map((article) => {
  const payload = sqlEscape(JSON.stringify(article))
  const id = sqlEscape(article.id)
  return `insert into public.cms_posts (id, payload, updated_at)
values ('${id}', '${payload}'::jsonb, now())
on conflict (id) do update set payload = excluded.payload, updated_at = now();`
})

const sql = `-- Seed May 16, 2026 world news for cms_posts (landing + category pages)
delete from public.cms_posts;

${statements.join('\n\n')}
`

writeFileSync('supabase/migrations/20260516210000_seed_today_cms_posts.sql', sql)
console.log(`Wrote ${todayArticles.length} posts to supabase/migrations/20260516210000_seed_today_cms_posts.sql`)
