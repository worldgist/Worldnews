import { writeFileSync } from 'node:fs'
import { todayArticles } from '../src/data/todayArticles.js'

const BASE_URL = 'https://worldgistnews.com'
const OUTPUT_PATH = 'public/sitemap.xml'

const NOW_ISO = new Date().toISOString()
const DEDICATED_CATEGORY_SLUGS = new Set([
  'world',
  'politics',
  'sports',
  'school',
  'technology',
  'entertainment',
])

const STATIC_ROUTES = [
  { path: '/', changefreq: 'hourly', priority: '1.0' },
  { path: '/world-news', changefreq: 'hourly', priority: '0.9' },
  { path: '/politics-news', changefreq: 'hourly', priority: '0.9' },
  { path: '/sports-news', changefreq: 'hourly', priority: '0.9' },
  { path: '/school-news', changefreq: 'hourly', priority: '0.8' },
  { path: '/technology-news', changefreq: 'hourly', priority: '0.9' },
  { path: '/entertainment-news', changefreq: 'hourly', priority: '0.9' },
  { path: '/trending', changefreq: 'daily', priority: '0.8' },
  { path: '/about-us', changefreq: 'monthly', priority: '0.5' },
  { path: '/contact-us', changefreq: 'monthly', priority: '0.5' },
  { path: '/advertise', changefreq: 'monthly', priority: '0.5' },
  { path: '/submit-news', changefreq: 'weekly', priority: '0.6' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.4' },
  { path: '/terms-and-conditions', changefreq: 'yearly', priority: '0.4' },
]

const categories = [...new Set(todayArticles.map((a) => a?.category).filter(Boolean))]
const articles = todayArticles

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function slugifyCategory(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
}

function toLastmod(value) {
  const parsed = Date.parse(value || '')
  const date = Number.isFinite(parsed) ? new Date(parsed) : new Date(NOW_ISO)
  return date.toISOString().split('T')[0]
}

function urlEntry({ loc, changefreq, priority, lastmod }) {
  return [
    '  <url>',
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod ? `    <lastmod>${xmlEscape(lastmod)}</lastmod>` : null,
    changefreq ? `    <changefreq>${xmlEscape(changefreq)}</changefreq>` : null,
    priority ? `    <priority>${xmlEscape(priority)}</priority>` : null,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n')
}

const dynamicCategoryRoutes = categories
  .map(slugifyCategory)
  .filter(Boolean)
  .filter((slug) => !DEDICATED_CATEGORY_SLUGS.has(slug))
  .map((slug) => ({
    path: `/category/${slug}`,
    changefreq: 'hourly',
    priority: '0.7',
  }))

const articleRoutes = articles
  .filter((article) => article?.id)
  .map((article) => ({
    path: `/article/${article.id}`,
    changefreq: 'daily',
    priority: article.featured ? '0.9' : '0.8',
    lastmod: toLastmod(article.publishedAt || article.updatedAt || article.date),
  }))

const allEntries = [...STATIC_ROUTES, ...dynamicCategoryRoutes, ...articleRoutes]

const dedupedByLoc = new Map()
for (const entry of allEntries) {
  const loc = `${BASE_URL}${entry.path}`
  if (!dedupedByLoc.has(loc)) {
    dedupedByLoc.set(loc, {
      loc,
      changefreq: entry.changefreq,
      priority: entry.priority,
      lastmod: entry.lastmod,
    })
  }
}

const xmlBody = Array.from(dedupedByLoc.values())
  .map(urlEntry)
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlBody}\n</urlset>\n`

writeFileSync(OUTPUT_PATH, xml)
console.log(`Sitemap generated: ${OUTPUT_PATH} (${dedupedByLoc.size} URLs)`)
